import axios from "axios"
import { ResultInterface } from "../interfaces/ResultInterface"

// VITE_API_URL is defined per environment in .env.development / .env.production.
const ENTRY_POINT = import.meta.env.VITE_API_URL

// The optional filters of a search. Each one is sent only when it is set.
const FILTER_KEYS = ["farmingMode", "mission", "itemName", "platform", "username"] as const

/** One search over the runs. Every filter is optional; the date range is not. */
export interface ResultQuery {
    /** Restrict to one Farming Mode. */
    farmingMode?: string
    /** Restrict to one mission. */
    mission?: string
    /** Restrict to one item. */
    itemName?: string
    /** Restrict to runs from one bot. */
    platform?: string
    /** Restrict to runs submitted by one account. */
    username?: string
    /** The oldest run to include. */
    startDate: Date
    /** The newest run to include. */
    endDate: Date
    /** Whether to sort oldest run first. */
    ascending: boolean
}

/** The outcome of one search. */
export interface ResultPage {
    /** The matching runs, already in the shape the components expect. */
    rows: ResultInterface[]
    /** True when the row ceiling was reached, so `rows` is only part of what matched. */
    truncated: boolean
}

/** The totals of one day of a search. */
export interface SummaryDay {
    /** The day as "YYYY-MM-DD", in the visitor's time zone. */
    day: string
    /** Total amount from GA (Windows) runs on that day. */
    amountGA: number
    /** Total amount from GAA (Android) runs on that day. */
    amountGAA: number
}

/** The totals of one mission in a search. */
export interface SummaryMission {
    /** The mission name. */
    mission: string
    /** Total amount across the mission's matching runs. */
    amount: number
    /** How many of the matching runs were of this mission. */
    runs: number
    /** How many of those runs have a usable elapsed time. Pending Battle drops do not. */
    timedRuns: number
    /** The average elapsed time of the timed runs, in seconds. 0 when there are none. */
    avgSeconds: number
}

/** The totals of one item in a search. */
export interface SummaryItem {
    /** The item name. */
    itemName: string
    /** Total amount of the item across the matching runs. */
    amount: number
    /** How many matching runs dropped or counted the item. */
    runs: number
}

/** The totals behind the charts. Unlike a `ResultPage` it covers every run the search matched, with no row ceiling. */
export interface ResultSummary {
    /** Totals per day, oldest first. Days without runs are left out. */
    days: SummaryDay[]
    /** Totals per mission, largest first. */
    missions: SummaryMission[]
    /** The items with the largest totals, largest first. The run counter item is left out. */
    items: SummaryItem[]
    /** How many runs the search matched. */
    totalRuns: number
    /** How many accounts submitted the matching runs. */
    players: number
}

/** What an empty result set looks like, so callers do not have to build one. */
export const EMPTY_PAGE: ResultPage = { rows: [], truncated: false }

/** What the summary of an empty result set looks like. */
export const EMPTY_SUMMARY: ResultSummary = { days: [], missions: [], items: [], totalRuns: 0, players: 0 }

/**
 * Turns a search into the query parameters both search routes read.
 *
 * @param query The search to run.
 * @returns The parameters, without the unset filters.
 */
const buildParams = (query: ResultQuery): Record<string, string> => {
    const params: Record<string, string> = { startDate: query.startDate.toISOString(), endDate: query.endDate.toISOString() }
    for (const key of FILTER_KEYS) {
        const value = query[key]
        if (value) {
            params[key] = value
        }
    }

    return params
}

/**
 * Fetches the runs matching a search. Every filter runs in the database, and the API caps how many rows come back.
 *
 * @param query The search to run.
 * @returns The matching runs and whether the row cap cut them short.
 */
export const fetchResults = async (query: ResultQuery): Promise<ResultPage> => {
    const res = await axios.get<ResultPage>(`${ENTRY_POINT}/api/results`, { params: { ...buildParams(query), ascending: String(query.ascending) } })
    return { ...res.data, rows: res.data.rows.map((row) => ({ ...row, elapsedTime: padElapsedTime(row.elapsedTime) })) }
}

/**
 * Pads the hours of an elapsed time to two digits. The Windows bot sends "0:01:22" and the Android bot "00:01:22", so this makes them
 * look the same and sort in the right order.
 *
 * @param elapsedTime The elapsed time as the bot sent it.
 * @returns The elapsed time as HH:MM:SS.
 */
const padElapsedTime = (elapsedTime: string): string => elapsedTime.replace(/^(\d):/, "0$1:")

/**
 * Fetches the totals for a search, summed in the database over every matching run. Days are split in the browser's time zone, so
 * they line up with the dates in the table. The API splits them in UTC when it does not know the zone.
 *
 * @param query The search to run.
 * @returns The totals per day and per mission.
 */
export const fetchSummary = async (query: ResultQuery): Promise<ResultSummary> => {
    const res = await axios.get<ResultSummary>(`${ENTRY_POINT}/api/results/summary`, { params: { ...buildParams(query), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone } })
    return res.data
}

/**
 * Fetches the date of the newest run on the site.
 *
 * @returns The date, or null when the site has no runs yet.
 */
export const fetchLatestDate = async (): Promise<Date | null> => {
    const res = await axios.get<{ date: string | null }>(`${ENTRY_POINT}/api/results/latest`)
    return res.data.date ? new Date(res.data.date) : null
}

/**
 * Formats a number of seconds as a run time, e.g. "1:05" or "1:02:03".
 *
 * @param seconds The time in seconds.
 * @returns The formatted time, or "-" when there is no time.
 */
export const formatSeconds = (seconds: number): string => {
    if (!seconds) return "-"

    const total = Math.round(seconds)
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const rest = String(total % 60).padStart(2, "0")
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`
}
