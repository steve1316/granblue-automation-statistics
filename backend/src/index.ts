import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import connectPgSimple from "connect-pg-simple"
import session from "express-session"
import { TOKEN_TTL_SECONDS } from "./auth"
import { config } from "./config"
import { pool, runMigrations } from "./db"
import { errorHandler } from "./middleware/errorHandler"
import AccountRoutes from "./routes/AccountRoutes"
import ItemRoutes from "./routes/ItemRoutes"
import ResultRoutes from "./routes/ResultRoutes"

// Keeps sessions in Postgres, so bots stay signed in across API restarts.
const PgSessionStore = connectPgSimple(session)

const app = express()

// //////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////
// Middleware

// Parse incoming data.
app.use(express.json())

// Express 5 no longer defaults req.body to {} for bodiless requests, so restore that behavior here.
app.use((req, _res, next) => {
    req.body ??= {}
    next()
})

// Behind a reverse proxy the client IP arrives in X-Forwarded-For, and the rate limiters need to read
// it to count per caller rather than per proxy.
if (config.trustProxy) {
    app.set("trust proxy", 1)
}

// CORS middleware. As a side note, make sure to port forward these localhost ports from VSCode if you
// are working remotely.
app.use(cors({ origin: config.corsOrigins, credentials: true }))

// Session middleware. The cookie keeps its original name and attributes because the bots already
// hold cookies issued under them.
app.use(
    session({
        store: new PgSessionStore({ pool: pool, tableName: "session" }),
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        // Lasts as long as a bearer token, so both kinds of sign-in expire together.
        cookie: { maxAge: TOKEN_TTL_SECONDS * 1000 },
    })
)

// Allows server to save, read and access a cookie.
app.use(cookieParser())

// //////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////
// Routes

// GET route reporting whether the server can reach its database.
app.get("/api/health", async (_req, res) => {
    try {
        await pool.query("select 1")
    } catch (err) {
        console.error("[health] Cannot reach Postgres: ", (err as Error).message)
        res.status(503).send({ status: "error", message: "Cannot reach the database." })
        return
    }

    res.status(200).send({ status: "ok" })
})

app.use(AccountRoutes)
app.use(ItemRoutes)
app.use(ResultRoutes)

// Has to be registered after the routes so that it catches what they throw.
app.use(errorHandler)

// //////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////
// Apply any pending migrations, then start the Express server on the specified port.

runMigrations()
    .then(() => {
        app.listen(config.port, () => {
            console.log(`Express server started on port ${config.port}.`)
            console.log(`Auth enforcement is set to "${config.authEnforcement}".`)
        })
    })
    .catch((err) => {
        console.error("[db] Failed to apply migrations: ", err)
        process.exit(1)
    })
