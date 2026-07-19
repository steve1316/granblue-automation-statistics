import fs from "fs"
import path from "path"
import { Pool } from "pg"
import { config } from "./config"

// Where the numbered .sql migration files live.
const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations")

// Any fixed number works. It just has to be the same for every API process sharing the database.
const MIGRATION_LOCK_ID = 727274

// The shared connection pool. Every query in the server goes through this.
export const pool = new Pool({ connectionString: config.databaseUrl })

/** An account, as the rest of the server sees it. */
export interface UserRow {
    /** The account's id. */
    id: string
    /** The username, with the casing it was registered with. */
    username: string
    /** The account's email address. */
    email: string
    /** The bcrypt hash of the account's password. */
    password_hash: string
    /** Whether the account can use the admin routes. */
    is_admin: boolean
    /** When the password last changed. Bearer tokens issued before this are rejected. */
    password_changed_at: Date
}

// Logged rather than thrown, since an idle client erroring should not crash the server.
pool.on("error", (err) => {
    console.error("[db] Idle client error: ", err.message)
})

/**
 * Applies every migration in `MIGRATIONS_DIR` that has not run yet, in file name order. Each one runs in its own transaction, and an
 * advisory lock stops two API processes from applying the same file at once.
 */
export const runMigrations = async () => {
    const client = await pool.connect()
    try {
        await client.query("select pg_advisory_lock($1)", [MIGRATION_LOCK_ID])
        await client.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())")

        const applied = new Set((await client.query<{ name: string }>("select name from schema_migrations")).rows.map((row) => row.name))
        const files = fs
            .readdirSync(MIGRATIONS_DIR)
            .filter((file) => file.endsWith(".sql"))
            .sort()

        for (const file of files) {
            if (applied.has(file)) continue

            const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8")
            try {
                await client.query("begin")
                await client.query(sql)
                await client.query("insert into schema_migrations (name) values ($1)", [file])
                await client.query("commit")
                console.log(`[db] Applied migration ${file}.`)
            } catch (err) {
                await client.query("rollback")
                throw err
            }
        }
    } finally {
        await client.query("select pg_advisory_unlock($1)", [MIGRATION_LOCK_ID]).catch(() => {})
        client.release()
    }
}

/**
 * Fetches an account by username, matched case-insensitively the same way the unique index does.
 *
 * @param username The username to look up.
 * @returns The account, or null when it does not exist.
 */
export const userForUsername = async (username: string): Promise<UserRow | null> => {
    const { rows } = await pool.query<UserRow>("select * from users where lower(username) = lower($1)", [username])
    return rows[0] ?? null
}

/**
 * Fetches an account by email address, matched case-insensitively the same way the unique index does.
 *
 * @param email The email address to look up.
 * @returns The account, or null when it does not exist.
 */
export const userForEmail = async (email: string): Promise<UserRow | null> => {
    const { rows } = await pool.query<UserRow>("select * from users where lower(email) = lower($1)", [email.trim()])
    return rows[0] ?? null
}

/**
 * Fetches an account by id.
 *
 * @param id The account's id.
 * @returns The account, or null when it does not exist.
 */
export const userForId = async (id: string): Promise<UserRow | null> => {
    const { rows } = await pool.query<UserRow>("select * from users where id = $1", [id])
    return rows[0] ?? null
}
