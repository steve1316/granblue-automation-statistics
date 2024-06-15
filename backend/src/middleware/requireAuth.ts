import { NextFunction, Request, Response } from "express"
import { AuthAuditSample, recordAuthAudit } from "../audit"
import { config } from "../config"
import { userForToken } from "../auth"
import { userForId } from "../db"

const BEARER_PREFIX = "Bearer "

/** Which credential a request proved its identity with. */
export type AuthSource = "cookie" | "bearer" | "none"

/** The identity attached to a request once its credentials have been resolved. */
export interface RequestAuth {
    /** The account id of the caller. */
    userId: string
    /** The caller's username, as held in their profile. */
    username: string
    /** Which credential the identity came from. */
    source: AuthSource
}

declare module "express-serve-static-core" {
    interface Request {
        /** The resolved caller, or null when the request carried no valid credential. */
        auth?: RequestAuth | null
    }
}

declare module "express-session" {
    interface SessionData {
        /** The account id of the signed-in caller. */
        userId?: string
        /** The signed-in caller's username. */
        username?: string
    }
}

/**
 * Resolves the caller's identity from an Authorization bearer token, then from the session cookie.
 * Bearer wins so that a client presenting both is judged on the stronger credential.
 *
 * @param req The incoming request.
 * @returns The caller's identity, or null when no valid credential was presented.
 */
const resolveIdentity = async (req: Request): Promise<RequestAuth | null> => {
    const header = req.headers.authorization
    if (header && header.startsWith(BEARER_PREFIX)) {
        const token = header.slice(BEARER_PREFIX.length).trim()
        const user = await userForToken(token)
        if (user) {
            return { userId: user.id, username: user.username, source: "bearer" }
        }
    }

    if (req.session?.userId && req.session?.username) {
        return { userId: req.session.userId, username: req.session.username, source: "cookie" }
    }

    return null
}

/**
 * Resolves the caller and attaches them to the request as `req.auth`.
 *
 * Whether an anonymous caller is rejected depends on `AUTH_ENFORCEMENT`. This route family has been
 * open since the original middleware was written, because it tested `!authenticationWorkaround` on an
 * imported function and so could never be true. That means the shipped bots may never have held a
 * working session, and switching straight to rejection could break every one of them at once. So the
 * default mode records what real traffic actually presents and rejects nothing. See SELF_HOSTING.md.
 *
 * @param req The incoming request.
 * @param res The response, used to reject an anonymous caller under "enforce".
 * @param next Passes control to the route.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    req.auth = await resolveIdentity(req)

    if (config.authEnforcement !== "off") {
        const body = req.body || {}
        const sample: AuthAuditSample = {
            route: req.route?.path || req.path,
            method: req.method,
            platform: typeof body.platform === "string" ? body.platform : "",
            appVersion: typeof body.appVersion === "string" ? body.appVersion : "",
            authSource: req.auth ? req.auth.source : "none",
            username: typeof body.username === "string" ? body.username : "",
        }

        // Not awaited on purpose - auditing must not add latency to a bot submission.
        void recordAuthAudit(sample)
    }

    if (config.authEnforcement === "enforce" && req.auth === null) {
        res.status(401).send({ message: "Not Authenticated." })
        return
    }

    next()
}

/**
 * Rejects any caller who is not signed in. Unlike `requireAuth` this always enforces. It guards the website's own routes, which
 * the bots never call.
 *
 * @param req The incoming request.
 * @param res The response, used to reject an anonymous caller.
 * @param next Passes control to the route.
 */
export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
    req.auth = await resolveIdentity(req)
    if (!req.auth) {
        res.status(401).send({ message: "Not Authenticated." })
        return
    }

    next()
}

/**
 * Rejects any caller who is not an admin. Unlike `requireAuth` this always enforces, because the only
 * route behind it deletes a user and all of their data.
 *
 * @param req The incoming request.
 * @param res The response, used to reject a non-admin caller.
 * @param next Passes control to the route.
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const auth = await resolveIdentity(req)
    if (!auth) {
        res.status(401).send({ message: "No user provided." })
        return
    }

    if (!(await userForId(auth.userId))?.is_admin) {
        res.status(401).send({ message: "User is not an admin." })
        return
    }

    req.auth = auth
    next()
}
