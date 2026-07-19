import { pool } from "./db"

// How many sample usernames each daily bucket keeps.
const MAX_SAMPLE_USERNAMES = 20

// Bumps the daily bucket for this request, adding the username to the samples while there is room.
const RECORD_SQL = `
insert into api_auth_audit as a (day, route, method, platform, app_version, auth_source, request_count, sample_usernames)
values (current_date, $1, $2, $3, $4, $5, 1, case when $6 = '' then '{}'::text[] else array[$6] end)
on conflict (day, route, method, platform, app_version, auth_source) do update
    set request_count = a.request_count + 1,
        sample_usernames = case
            when $6 = '' or a.sample_usernames @> array[$6] or coalesce(array_length(a.sample_usernames, 1), 0) >= $7 then a.sample_usernames
            else a.sample_usernames || $6
        end`

/** One request's worth of audit detail, copied out of the request before it is recorded. */
export interface AuthAuditSample {
    /** The route pattern the request matched. */
    route: string
    /** The HTTP method used. */
    method: string
    /** Which bot sent it, when it said. */
    platform: string
    /** The app version it reported, when it sent one. */
    appVersion: string
    /** How the request authenticated, or "none". */
    authSource: string
    /** The username in the body, kept so affected users can be contacted before enforcement. */
    username: string
}

/**
 * Records one request against its daily audit bucket, so that auth enforcement can eventually be
 * turned on with evidence rather than hope. Deliberately fire and forget: a failure to audit must
 * never turn into a failed bot submission.
 *
 * It takes a plain sample rather than the request itself. Holding the request would keep its socket,
 * headers, body and session reachable for as long as this promise is outstanding, which under load
 * means a full request graph pinned per in-flight audit.
 *
 * @param sample The details to record.
 */
export const recordAuthAudit = async (sample: AuthAuditSample) => {
    try {
        await pool.query(RECORD_SQL, [sample.route, sample.method, sample.platform, sample.appVersion, sample.authSource, sample.username, MAX_SAMPLE_USERNAMES])
    } catch (err) {
        console.error("[audit] Failed to record an auth sample: ", (err as Error).message)
    }
}
