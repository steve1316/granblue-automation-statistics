import express, { Router } from "express"
import * as xml2js from "xml2js"
import { config } from "../config"
import { pool, userForUsername } from "../db"
import { requireAuth, requireUser } from "../middleware/requireAuth"
import { requireStringParams } from "../middleware/validateBody"

const router: Router = express.Router()

// The two platforms the bots identify themselves as.
const SUPPORTED_PLATFORMS = ["GA", "GAA"]

// What the bots send for a run that reported no elapsed time, e.g. a Pending Battle drop.
const ZERO_ELAPSED_TIMES = ["0", "0.0"]

// A bot release happens about once a month, so the version gate remembers what it found rather than
// making an outbound request per submission.
const VERSION_CACHE_TTL_MS = 10 * 60 * 1000

// The last known release version per platform, and the lookups currently in flight. The in-flight map
// collapses a burst of submissions into a single outbound request instead of one each.
const versionCache = new Map<string, { version: string; fetchedAt: number }>()
const versionLookups = new Map<string, Promise<VersionLookup>>()

// The most rows one dashboard search returns. Past this the website asks the user to narrow the date range.
const MAX_SEARCH_ROWS = 20000

// The dashboard's optional search filters, mapped to the columns they match on. Only these names ever reach the SQL.
const SEARCH_FILTER_COLUMNS: Record<string, string> = {
    farmingMode: "farming_mode",
    mission: "mission",
    itemName: "item_name",
    platform: "platform",
    username: "username",
}

// The columns a search returns, aliased to the camelCase the website's components read.
const SEARCH_COLUMNS = `date, elapsed_time as "elapsedTime", item_name as "itemName", amount, farming_mode as "farmingMode", mission, platform, username`

// The time zone the summary splits days in when the caller names none, or one the server does not know.
const FALLBACK_TIME_ZONE = "UTC"

// How many items the summary's top items list holds.
const TOP_ITEMS_LIMIT = 10

// The item name the bots use for a run that only counts how often a mission was cleared. It is not a drop, so the top items list skips it.
const RUN_COUNTER_ITEM = "Repeated Runs"

// A run's elapsed time in seconds, or null for a missing, malformed or Pending Battle ("00:00:00") time.
const ELAPSED_SECONDS_SQL = `case when elapsed_time ~ '^[0-9]+:[0-9]{2}:[0-9]{2}$' and elapsed_time <> '00:00:00' then extract(epoch from elapsed_time::interval) end`

// How long a server-side query cache entry stays valid before a fresh database round trip.
const QUERY_CACHE_TTL_MS = 60 * 60 * 1000

/** One entry in the server-side query cache. */
interface QueryCacheEntry {
    /** The JSON-serializable response body. */
    body: unknown
    /** When the entry was stored. */
    storedAt: number
}

const queryCache = new Map<string, QueryCacheEntry>()

/**
 * Returns a cached response body when one exists and has not expired, otherwise undefined.
 *
 * @param key The cache key to look up.
 * @returns The cached body, or undefined when the entry is missing or stale.
 */
const fromQueryCache = (key: string): unknown | undefined => {
    const entry = queryCache.get(key)
    if (!entry) return undefined
    if (Date.now() - entry.storedAt > QUERY_CACHE_TTL_MS) {
        queryCache.delete(key)
        return undefined
    }
    return entry.body
}

/**
 * Stores a response body in the query cache and returns it unchanged.
 *
 * @param key The cache key to store under.
 * @param body The response body to cache.
 * @returns The same `body` that was stored.
 */
const toQueryCache = (key: string, body: unknown): unknown => {
    queryCache.set(key, { body, storedAt: Date.now() })
    return body
}

/** The conditions of a dashboard search, with the values their placeholders stand for. */
interface SearchFilter {
    /** The conditions for a where clause, joined with "and". */
    where: string
    /** The value for each placeholder, in order. */
    values: unknown[]
}

/** A version-gate rejection, ready to be sent as-is. */
interface GateFailure {
    /** The HTTP status to reply with. */
    status: number
    /** The body to send. A bare string on the network-failure paths, matching the old API exactly. */
    body: object | string
}

/** Either the current release version for a platform, or the reason it could not be read. */
type VersionLookup = { version: string } | { failure: GateFailure }

/**
 * Fetches the current release version for a platform.
 *
 * Every failure shape here is reproduced from the original implementation, including the three that
 * reply with a bare string instead of JSON - a shipped bot may be reading those with `res.text()`.
 *
 * @param platform Which bot to look up.
 * @returns The current version, or the rejection to send in its place.
 */
const readCurrentVersion = async (platform: string): Promise<VersionLookup> => {
    if (platform === "GA") {
        try {
            const response = await fetch(config.gaUpdateJsonUrl)
            if (response.status !== 200) {
                return { failure: { status: 400, body: { message: `Cannot fetch current desktop app version due to status code ${response.status}.` } } }
            }

            const payload: any = await response.json()
            return { version: payload.version }
        } catch (err) {
            return { failure: { status: 400, body: `Cannot fetch current desktop app version using link with error: ${err}` } }
        }
    }

    let xmlText: string
    try {
        const response = await fetch(config.gaaUpdateXmlUrl)
        if (response.status !== 200) {
            return { failure: { status: 400, body: `Cannot fetch current mobile app version due to status code ${response.status}.` } }
        }
        xmlText = await response.text()
    } catch (err) {
        return { failure: { status: 400, body: `Cannot fetch current mobile app version using link with error: ${err}` } }
    }

    try {
        const parsed: any = await xml2js.parseStringPromise(xmlText)
        return { version: parsed.AppUpdater.update[0].latestVersion[0] }
    } catch {
        return { failure: { status: 500, body: { message: "Failed to parse the XML to JSON when reading in the mobile app version." } } }
    }
}

/**
 * Checks a submission's reported app version against the current release of the bot that sent it.
 * Only a successful lookup is cached, so an upstream outage is retried rather than remembered.
 *
 * @param platform Which bot sent the submission.
 * @param appVersion The version the bot reported.
 * @returns Null when the version is current, otherwise the rejection to send instead.
 */
const checkAppVersion = async (platform: string, appVersion: string): Promise<GateFailure | null> => {
    const cached = versionCache.get(platform)
    let result: VersionLookup

    if (cached && Date.now() - cached.fetchedAt < VERSION_CACHE_TTL_MS) {
        result = { version: cached.version }
    } else {
        const lookup =
            versionLookups.get(platform) ??
            readCurrentVersion(platform).then((outcome) => {
                if ("version" in outcome) {
                    versionCache.set(platform, { version: outcome.version, fetchedAt: Date.now() })
                }

                versionLookups.delete(platform)
                return outcome
            })

        versionLookups.set(platform, lookup)
        result = await lookup
    }

    if ("failure" in result) {
        return result.failure
    }

    return appVersion !== result.version ? { status: 401, body: { message: `Wrong App version for ${platform}.` } } : null
}

// POST route to create a new result for an item. The bot at this point has already checked if the item
// exists before calling this.
router.post("/api/create-result", requireAuth, async (req, res) => {
    const { appVersion, username, farmingMode, mission, itemName, platform, amount, elapsedTime } = req.body

    // Validation runs before the version gate so that a malformed submission is rejected without first
    // paying for an outbound lookup.
    if (!requireStringParams(res, { username, farmingMode, mission, itemName, platform, elapsedTime })) return

    // `amount` is checked separately because it is the one field that is not a string. Note it is not
    // tested for truthiness: doing that rejected a legitimate submission of 0.
    if (typeof amount !== "number") {
        res.status(400).send({ message: "Improper values for parameters." })
        return
    }

    if (Number.isNaN(amount) || amount < 0) {
        res.status(400).send({ message: "Improper value for the item amount." })
        return
    }

    if (!SUPPORTED_PLATFORMS.includes(platform)) {
        res.status(400).send({ message: "API request came from an supported platform." })
        return
    }

    if (appVersion && config.versionGateEnabled) {
        const failure = await checkAppVersion(platform, appVersion)
        if (failure) {
            res.status(failure.status).send(failure.body)
            return
        }
    }

    const user = await userForUsername(username)
    if (!user) {
        res.status(404).send({ message: "User does not exist." })
        return
    }

    const newElapsedTime = ZERO_ELAPSED_TIMES.includes(elapsedTime) ? "00:00:00" : elapsedTime

    // Inserting the result is the only write. A trigger updates the item's total and creates the catalog row if it is missing.
    try {
        await pool.query("insert into results (user_id, username, item_name, farming_mode, mission, amount, platform, elapsed_time) values ($1, $2, $3, $4, $5, $6, $7, $8)", [
            user.id,
            user.username,
            itemName,
            farmingMode,
            mission,
            amount,
            platform,
            newElapsedTime,
        ])
    } catch (err) {
        console.error(`[result] Failed to create a result for ${username}: `, (err as Error).message)
        res.status(500).send({ message: "Failed to create the result." })
        return
    }

    console.log(`Successfully created result of ${amount}x ${itemName} of ${mission} for ${farmingMode} Farming Mode for ${username}.`)
    res.status(201).send({ message: `Successfully created result of ${amount}x ${itemName} of ${mission} for ${farmingMode} Farming Mode.` })
})

/**
 * Builds the conditions both dashboard searches share from a request's query parameters: startDate and endDate (ISO strings,
 * required), and any of farmingMode, mission, itemName, platform and username.
 *
 * @param query The request's query parameters.
 * @returns The conditions and their values, or null when a date is missing or not a date.
 */
const buildSearchFilter = (query: Record<string, unknown>): SearchFilter | null => {
    const startDate = new Date(String(query.startDate))
    const endDate = new Date(String(query.endDate))
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return null
    }

    const values: unknown[] = [startDate, endDate]
    const clauses = ["date >= $1", "date <= $2"]
    for (const [key, column] of Object.entries(SEARCH_FILTER_COLUMNS)) {
        const value = query[key]
        if (typeof value === "string" && value !== "") {
            values.push(value)
            clauses.push(`${column} = $${values.length}`)
        }
    }

    return { where: clauses.join(" and "), values: values }
}

// GET route for the website's dashboard table. Every filter runs in the database, and the reply says whether the row cap cut
// the results short. Query parameters: the ones `buildSearchFilter` reads, plus ascending ("true" or "false").
router.get("/api/results", requireUser, async (req, res) => {
    const query = req.query as Record<string, unknown>
    const filter = buildSearchFilter(query)
    if (!filter) {
        res.status(400).send({ message: "Improper values for parameters." })
        return
    }

    const direction = query.ascending === "true" ? "asc" : "desc"
    const cacheKey = `results:${filter.where}:${JSON.stringify(filter.values)}:${direction}`
    const cached = fromQueryCache(cacheKey)
    if (cached) {
        res.status(200).send(cached)
        return
    }

    const values = [...filter.values, MAX_SEARCH_ROWS + 1]
    const { rows } = await pool.query(`select ${SEARCH_COLUMNS} from results where ${filter.where} order by date ${direction}, id ${direction} limit $${values.length}`, values)

    const truncated = rows.length > MAX_SEARCH_ROWS
    const body = { rows: truncated ? rows.slice(0, MAX_SEARCH_ROWS) : rows, truncated }
    toQueryCache(cacheKey, body)
    res.status(200).send(body)
})

/**
 * Checks a time zone name from a request, so a bad one never reaches the SQL.
 *
 * @param value The timeZone query parameter.
 * @returns The zone when it is a known IANA name, otherwise UTC.
 */
const timeZoneFrom = (value: unknown): string => {
    if (typeof value !== "string" || value === "") return FALLBACK_TIME_ZONE

    try {
        new Intl.DateTimeFormat("en-US", { timeZone: value })
        return value
    } catch {
        return FALLBACK_TIME_ZONE
    }
}

// GET route for the website's dashboard charts and panels. It sums every run the search matches, so they stay complete when the
// table hits its row cap. Query parameters: the ones `buildSearchFilter` reads, plus timeZone (an IANA name such as "Asia/Tokyo"),
// which decides where one day ends and the next begins. A missing or unknown zone counts as UTC.
router.get("/api/results/summary", requireUser, async (req, res) => {
    const query = req.query as Record<string, unknown>
    const filter = buildSearchFilter(query)
    if (!filter) {
        res.status(400).send({ message: "Improper values for parameters." })
        return
    }

    const tz = timeZoneFrom(query.timeZone)
    const cacheKey = `summary:${filter.where}:${JSON.stringify(filter.values)}:${tz}`
    const cached = fromQueryCache(cacheKey)
    if (cached) {
        res.status(200).send(cached)
        return
    }

    const values = [...filter.values, tz]

    const daysSql = `
        select to_char(t.local, 'YYYY-MM-DD') as day, t."amountGA", t."amountGAA", t.runs
        from (
            select date_trunc('day', date at time zone $${values.length}::text) as local,
                   coalesce(sum(amount) filter (where platform = 'GA'), 0)::float8 as "amountGA",
                   coalesce(sum(amount) filter (where platform = 'GAA'), 0)::float8 as "amountGAA",
                   count(*)::int as runs
            from results
            where ${filter.where}
            group by 1
        ) t
        order by t.local`
    const missionsSql = `
        select mission, sum(amount)::float8 as amount, count(*)::int as runs, count(seconds)::int as "timedRuns", coalesce(avg(seconds), 0)::float8 as "avgSeconds"
        from (select mission, amount, ${ELAPSED_SECONDS_SQL} as seconds from results where ${filter.where}) t
        group by mission order by amount desc, mission`
    const itemsSql = `select item_name as "itemName", sum(amount)::float8 as amount, count(*)::int as runs from results where ${filter.where} and item_name <> '${RUN_COUNTER_ITEM}' group by item_name order by amount desc, item_name limit ${TOP_ITEMS_LIMIT}`
    const playersSql = `select count(distinct username)::int as players from results where ${filter.where}`

    const [dayResult, missionResult, itemResult, playerResult] = await Promise.all([
        pool.query<{ day: string; amountGA: number; amountGAA: number; runs: number }>(daysSql, values),
        pool.query<{ mission: string; amount: number; runs: number; timedRuns: number; avgSeconds: number }>(missionsSql, filter.values),
        pool.query<{ itemName: string; amount: number; runs: number }>(itemsSql, filter.values),
        pool.query<{ players: number }>(playersSql, filter.values),
    ])

    const body = {
        days: dayResult.rows.map(({ day, amountGA, amountGAA }) => ({ day, amountGA, amountGAA })),
        missions: missionResult.rows,
        items: itemResult.rows,
        totalRuns: dayResult.rows.reduce((sum, row) => sum + row.runs, 0),
        players: playerResult.rows[0].players,
    }
    toQueryCache(cacheKey, body)

    res.status(200).send(body)
})

// GET route for the date of the newest run, so the dashboard can open on a range that has runs in it. The date is null when
// there are no runs at all.
router.get("/api/results/latest", requireUser, async (_req, res) => {
    const cached = fromQueryCache("latest")
    if (cached) {
    
        res.status(200).send(cached)
        return
    }

    const { rows } = await pool.query<{ date: Date | null }>("select max(date) as date from results")
    const body = { date: rows[0].date }
    toQueryCache("latest", body)

    res.status(200).send(body)
})

export default router
