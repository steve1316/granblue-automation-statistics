import express, { Request, Response, Router } from "express"
import rateLimit from "express-rate-limit"
import { DatabaseError } from "pg"
import { checkCredentials, createResetToken, hashPassword, hashResetToken, issueToken } from "../auth"
import { config } from "../config"
import { pool, UserRow, userForEmail, userForId, userForUsername } from "../db"
import { sendPasswordResetEmail } from "../mail"
import { requireAdmin } from "../middleware/requireAuth"
import { requireStringParams } from "../middleware/validateBody"

const router: Router = express.Router()

// Postgres error codes for a unique index violation and a failed check constraint.
const UNIQUE_VIOLATION = "23505"
const CHECK_VIOLATION = "23514"

// The sign-up form asks for at least this many characters and one number.
const MIN_PASSWORD_LENGTH = 5
const WEAK_PASSWORD_MESSAGE = `Password must be at least ${MIN_PASSWORD_LENGTH} characters and contain a number.`

// How long a password reset link stays valid.
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

// Ends every stored session belonging to one account. Indexed by `session_user_id_idx`.
const END_SESSIONS_SQL = "delete from session where sess ->> 'userId' = $1"

// Sign-in is rate limited per IP.
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false })

// Sign-up is capped so the user table cannot be filled by a script.
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false })

// Recovery is capped much harder, since every accepted request sends an email.
const recoveryLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false })

/**
 * Replies with the legacy failed-login shape: a 401 with the body "Unauthorized" as HTML. Bots may check for this, so keep it.
 *
 * @param res The response to write the rejection to.
 */
const sendUnauthorized = (res: Response) => {
    res.status(401).type("html").send("Unauthorized")
}

/**
 * Checks a new password against the same rules the sign-up form shows.
 *
 * @param password The password to check.
 * @returns True when the password is long enough and contains a number.
 */
const isAcceptablePassword = (password: string): boolean => password.length >= MIN_PASSWORD_LENGTH && /\d/.test(password)

/**
 * Rotates the session id and stores the signed-in identity on it. Rotating on login prevents session fixation.
 *
 * @param req The request whose session should be started.
 * @param user The account that just signed in.
 */
const startSession = (req: Request, user: UserRow): Promise<void> =>
    new Promise((resolve, reject) => {
        req.session.regenerate((regenerateError) => {
            if (regenerateError) {
                reject(regenerateError)
                return
            }

            req.session.userId = user.id
            req.session.username = user.username
            req.session.save((saveError) => (saveError ? reject(saveError) : resolve()))
        })
    })

/**
 * Ends every stored session belonging to an account, so a password change or a deletion signs it out everywhere.
 *
 * @param userId The account whose sessions should end.
 */
const endSessionsFor = async (userId: string) => {
    await pool.query(END_SESSIONS_SQL, [userId])
}

// //////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////
// Registration

// POST route to register a new user.
router.post("/api/register", registerLimiter, async (req: Request, res: Response) => {
    const { username, password, email } = req.body
    if (!requireStringParams(res, { username, password, email })) return

    if (!isAcceptablePassword(password)) {
        res.status(400).send({ message: WEAK_PASSWORD_MESSAGE })
        return
    }

    try {
        await pool.query("insert into users (username, email, password_hash) values ($1, $2, $3)", [username, email.trim(), await hashPassword(password)])
    } catch (err) {
        if (err instanceof DatabaseError && err.code === UNIQUE_VIOLATION) {
            const message = err.constraint === "users_email_lower_idx" ? "Email already registered." : "Username already exists."
            res.status(409).send({ message: message })
            return
        }

        if (err instanceof DatabaseError && err.code === CHECK_VIOLATION) {
            res.status(400).send({ message: "Usernames cannot contain spaces or an @ and must be at most 64 characters." })
            return
        }

        throw err
    }

    res.status(201).send({ message: "Successfully created user." })
})

// //////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////
// Sign in and out

// POST route to login. The bots depend on the success body and on the legacy plain-text failure, so neither can change.
router.post("/api/login", loginLimiter, async (req, res) => {
    const { username, password } = req.body
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        sendUnauthorized(res)
        return
    }

    const user = await checkCredentials(username, password)
    if (!user) {
        sendUnauthorized(res)
        return
    }

    await startSession(req, user)
    res.status(200).send({ message: "Successfully authenticated user." })
})

// POST route to login and also get a bearer token in the response body. The website only needs the session cookie it sets. The
// token is for the desktop client, which runs in Tauri and cannot read a Set-Cookie header.
router.post("/api/v2/login", loginLimiter, async (req, res) => {
    const { username, password } = req.body
    if (!requireStringParams(res, { username, password })) return

    const user = await checkCredentials(username, password)
    if (!user) {
        res.status(401).send({ message: "Username/Password was incorrect." })
        return
    }

    await startSession(req, user)
    const { token, expiresAt } = issueToken(user)
    res.status(200).send({ access_token: token, expires_at: expiresAt, username: user.username, isAdmin: user.is_admin })
})

// GET route to fetch the signed-in user. The website calls this on every load, so nobody being signed in is a normal 204 rather
// than an error.
router.get("/api/me", async (req, res) => {
    const userId = req.session?.userId
    const user = userId ? await userForId(userId) : null
    if (!user) {
        res.status(204).send()
        return
    }

    res.status(200).send({ username: user.username, isAdmin: user.is_admin })
})

// GET route to log out the user.
router.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).send({ message: "Failed to log out." })
            return
        }

        res.clearCookie("connect.sid")
        res.status(200).send({ message: "Successfully logged out." })
    })
})

// //////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////
// Accounts

// GET route to fetch a user by their username. The "does not exists" typo is kept because bots have shipped against it.
router.get("/api/get-user/:username", async (req, res) => {
    if (!requireStringParams(res, req.params)) return
    const { username } = req.params

    if (await userForUsername(username)) {
        res.status(200).send({ message: "User exists." })
    } else {
        res.status(404).send({ message: "User does not exists." })
    }
})

// PUT route to delete a user and all of their results. Deleting the user cascades to their results, and the trigger updates the
// item totals.
router.put("/api/delete-user/:username", requireAdmin, async (req, res) => {
    if (!requireStringParams(res, req.params)) return
    const { username } = req.params

    const user = await userForUsername(username)
    if (!user) {
        res.status(200).send({ message: "User successfully deleted." })
        return
    }

    await pool.query("delete from users where id = $1", [user.id])
    await endSessionsFor(user.id)

    console.log(`User ${username} and all of their records have been successfully deleted.`)
    res.status(200).send({ message: "User and their data have been successfully deleted." })
})

// //////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////
// Password recovery

// POST route to start the password recovery process. Emails a one-time link to <siteUrl>/reset-password.
router.post("/api/forgot-password", recoveryLimiter, async (req, res) => {
    const { recoveryEntryPoint } = req.body
    if (!requireStringParams(res, { recoveryEntryPoint })) return

    // One field holds either a username or an email. Try it as a username first, then as an address.
    const user = (await userForUsername(recoveryEntryPoint)) ?? (await userForEmail(recoveryEntryPoint))

    if (user) {
        const { token, hash } = createResetToken()
        await pool.query("insert into password_resets (token_hash, user_id, expires_at) values ($1, $2, $3)", [hash, user.id, new Date(Date.now() + RESET_TOKEN_TTL_MS)])

        try {
            await sendPasswordResetEmail(user.email, user.username, `${config.siteUrl}/reset-password?token=${token}`)
        } catch (err) {
            console.error("[account] Failed to send a password reset email: ", (err as Error).message)
        }
    }

    // Always the same answer. Saying whether the account exists would let anyone check which usernames are registered.
    res.status(200).send({ message: "Password reset link has been emailed." })
})

// GET route to check whether a password reset link is still usable, so the page can say so before the user types anything.
router.get("/api/reset-password/:token", async (req, res) => {
    if (!requireStringParams(res, req.params)) return

    const { rowCount } = await pool.query("select 1 from password_resets where token_hash = $1 and used_at is null and expires_at > now()", [hashResetToken(req.params.token)])
    res.status(200).send({ valid: rowCount === 1 })
})

// POST route to set a new password using a reset link. Every step runs in one transaction, so a link is only spent when the new
// password is actually saved, and it then spends the account's other open links too.
router.post("/api/reset-password", async (req, res) => {
    const { token, password } = req.body
    if (!requireStringParams(res, { token, password })) return

    if (!isAcceptablePassword(password)) {
        res.status(400).send({ message: WEAK_PASSWORD_MESSAGE })
        return
    }

    const passwordHash = await hashPassword(password)
    const client = await pool.connect()
    try {
        await client.query("begin")
        const { rows } = await client.query<{ user_id: string }>("select user_id from password_resets where token_hash = $1 and used_at is null and expires_at > now() for update", [
            hashResetToken(token),
        ])
        if (rows.length === 0) {
            await client.query("rollback")
            res.status(400).send({ message: "Password reset link is invalid or has expired." })
            return
        }

        const userId = rows[0].user_id
        await client.query("update users set password_hash = $1, password_changed_at = now() where id = $2", [passwordHash, userId])
        await client.query("update password_resets set used_at = now() where user_id = $1 and used_at is null", [userId])
        await client.query(END_SESSIONS_SQL, [userId])
        await client.query("commit")
    } catch (err) {
        await client.query("rollback").catch(() => {})
        throw err
    } finally {
        client.release()
    }

    res.status(200).send({ message: "Password successfully reset." })
})

export default router
