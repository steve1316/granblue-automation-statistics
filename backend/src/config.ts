import dotenv from "dotenv"

dotenv.config()

// The origins allowed to make credentialed requests. "https://tauri.localhost" is the GA desktop
// client and must stay in any override.
const DEFAULT_CORS_ORIGINS = "http://localhost:3000,http://localhost:4000,http://localhost:5173,https://tauri.localhost"

// Where the version gate looks up the current bot releases. Configurable so a fork, or a self-hosted
// instance with no outbound internet, can point them elsewhere or turn the gate off entirely.
const DEFAULT_GA_UPDATE_JSON_URL = "https://raw.githubusercontent.com/steve1316/granblue-automation-pyautogui/main/src-tauri/update.json"
const DEFAULT_GAA_UPDATE_XML_URL = "https://raw.githubusercontent.com/steve1316/granblue-automation-android/main/android/app/update.xml"

const VALID_AUTH_ENFORCEMENT = ["off", "observe", "enforce"] as const

/** How the API treats a request that arrives without valid credentials. */
export type AuthEnforcement = (typeof VALID_AUTH_ENFORCEMENT)[number]

/**
 * Reads a required environment variable, stopping the process if it is missing. Failing at startup is
 * much easier to diagnose than failing on the first request.
 *
 * @param name The name of the environment variable.
 * @returns The variable's value.
 */
const required = (name: string): string => {
    const value = process.env[name]
    if (!value) {
        console.error(`[config] ${name} is not set. See SELF_HOSTING.md.`)
        process.exit(1)
    }
    return value
}

/**
 * Reads the auth enforcement mode, falling back to "observe" when it is unset or not a known value.
 *
 * @returns The enforcement mode the middleware should run in.
 */
const readAuthEnforcement = (): AuthEnforcement => {
    const value = (process.env.AUTH_ENFORCEMENT || "observe").toLowerCase()
    if (!VALID_AUTH_ENFORCEMENT.includes(value as AuthEnforcement)) {
        console.warn(`[config] AUTH_ENFORCEMENT="${value}" is not one of ${VALID_AUTH_ENFORCEMENT.join(", ")}. Falling back to "observe".`)
        return "observe"
    }
    return value as AuthEnforcement
}

export const config = {
    // Postgres connection string, e.g. postgres://gas:password@db:5432/gas
    databaseUrl: required("DATABASE_URL"),
    sessionSecret: required("EXPRESS_SESSION_SECRET"),
    // Signs the bearer tokens handed out by POST /api/v2/login.
    jwtSecret: required("JWT_SECRET"),
    port: Number(process.env.EXPRESS_PORT) || 4000,
    corsOrigins: (process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS)
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin !== ""),
    // The website's address. The password reset email links to <siteUrl>/reset-password.
    siteUrl: (process.env.SITE_URL || "http://localhost:5173").replace(/\/+$/, ""),
    authEnforcement: readAuthEnforcement(),
    // Set this when the server sits behind a reverse proxy, so the rate limiters count the real
    // caller rather than the proxy.
    trustProxy: process.env.TRUST_PROXY === "true",
    versionGateEnabled: process.env.VERSION_GATE_ENABLED !== "false",
    gaUpdateJsonUrl: process.env.GA_UPDATE_JSON_URL || DEFAULT_GA_UPDATE_JSON_URL,
    gaaUpdateXmlUrl: process.env.GAA_UPDATE_XML_URL || DEFAULT_GAA_UPDATE_XML_URL,
    // Outgoing mail for password recovery. With no SMTP_HOST the reset link is written to the log instead.
    smtp: {
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
        from: process.env.SMTP_FROM || "Granblue Automation Statistics <no-reply@localhost>",
    },
}

if (config.sessionSecret === config.jwtSecret) {
    console.error("[config] EXPRESS_SESSION_SECRET and JWT_SECRET must be different values.")
    process.exit(1)
}
