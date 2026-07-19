import bcrypt from "bcryptjs"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { config } from "./config"
import { UserRow, userForId, userForUsername } from "./db"

// bcrypt work factor. 12 takes roughly a quarter of a second per hash on modest hardware.
const BCRYPT_ROUNDS = 12

// How long a bearer token from POST /api/v2/login stays valid, in seconds. The session cookie uses the same lifetime.
export const TOKEN_TTL_SECONDS = 60 * 60 * 24

// A real hash to compare against when the username does not exist, so a miss takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS)

/**
 * Hashes a password for storage.
 *
 * @param password The plain password.
 * @returns The bcrypt hash.
 */
export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, BCRYPT_ROUNDS)

/**
 * Checks a username and password against the stored hash.
 *
 * @param username The username being signed in.
 * @param password The password to check.
 * @returns The account when the password matches, otherwise null.
 */
export const checkCredentials = async (username: string, password: string): Promise<UserRow | null> => {
    const user = await userForUsername(username)
    const matches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH)
    return user && matches ? user : null
}

/**
 * Issues a signed bearer token for an account.
 *
 * @param user The account the token is for.
 * @returns The token and the Unix time in seconds when it expires.
 */
export const issueToken = (user: UserRow): { token: string; expiresAt: number } => {
    const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
    const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: TOKEN_TTL_SECONDS })
    return { token, expiresAt }
}

/**
 * Resolves a bearer token to its account. A token issued before the account's last password change is rejected, so resetting a
 * password signs out every client holding an old token.
 *
 * @param token The bearer token.
 * @returns The account, or null when the token is invalid, expired or stale.
 */
export const userForToken = async (token: string): Promise<UserRow | null> => {
    let payload: jwt.JwtPayload
    try {
        payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload
    } catch {
        return null
    }

    if (typeof payload.sub !== "string" || typeof payload.iat !== "number") {
        return null
    }

    const user = await userForId(payload.sub)
    if (!user || payload.iat < Math.floor(user.password_changed_at.getTime() / 1000)) {
        return null
    }

    return user
}

/**
 * Hashes a password reset token the same way it was stored.
 *
 * @param token The token from the reset link.
 * @returns Its sha256 hash, hex encoded.
 */
export const hashResetToken = (token: string): string => crypto.createHash("sha256").update(token).digest("hex")

/**
 * Creates a random one-time token for a password reset link.
 *
 * @returns The token to put in the link, and the hash to store in the database.
 */
export const createResetToken = (): { token: string; hash: string } => {
    const token = crypto.randomBytes(32).toString("base64url")
    return { token, hash: hashResetToken(token) }
}
