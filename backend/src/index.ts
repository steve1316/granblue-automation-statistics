import bcrypt from "bcryptjs"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import mongoose, { MongooseError } from "mongoose"
import passport from "passport"
import passportLocal from "passport-local"
import session from "express-session"
import User from "./schemas/User"
import { UserInterface } from "./interfaces/UserInterface"
import ResultRoutes from "./routes/ResultRoutes"
import ItemRoutes from "./routes/ItemRoutes"
import AccountRoutes from "./routes/AccountRoutes"

dotenv.config()

////////////////////
// Connect to MongoDB cluster.
mongoose.connect(process.env.MONGODB_URI as string, (err: MongooseError) => {
    if (err) throw err
    console.log("Connected to MongoDB Cluster.")
})

////////////////////
// Middleware
const app = express()

// Parse incoming data.
app.use(express.json())

// CORS middleware.
app.use(cors({ origin: ["http://localhost:3000", "https://granblue-automation-statistics.com", "https://tauri.localhost"], credentials: true }))
const oneDaySession = 1000 * 60 * 60 * 24 // In milliseconds.

// Session middleware.
app.use(
    session({
        secret: process.env.EXPRESS_SESSION_SECRET ? process.env.EXPRESS_SESSION_SECRET : "devEnvironmentSecret",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: oneDaySession },
    })
)

// Allows server to save, read and access a cookie.
app.use(cookieParser())

// Initialize passport authentication.
app.use(passport.initialize())

// Persist passport sessions.
app.use(passport.session())

////////////////////
// Passport
const LocalStrategy = passportLocal.Strategy
passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({ username: username }, (err: Error, user: UserInterface) => {
            if (err) throw err

            if (!user) {
                return done(null, false)
            } else {
                // Use bcrypt to compare the hashes.
                bcrypt.compare(password, user.password, (bcryptError, result) => {
                    if (bcryptError) {
                        throw bcryptError
                    }

                    if (result === true) {
                        return done(null, user)
                    } else {
                        return done(null, false)
                    }
                })
            }
        })
    })
)
passport.serializeUser((user: any, cb) => {
    // Persist user data after successful authentication throughout the session.
    cb(null, user.id)
})
passport.deserializeUser((id: string, cb) => {
    // Attaches the user object to the session's object in the request.
    User.findOne({ _id: id }, (err: Error, user: UserInterface) => {
        const userInfo = {
            username: user.username,
            isAdmin: user.isAdmin,
        }

        cb(err, userInfo)
    })
})

////////////////////
// Routes

app.use(AccountRoutes)
app.use(ItemRoutes)
app.use(ResultRoutes)

////////////////////
// Start the Express server on the specified port.
app.listen(process.env.EXPRESS_PORT || 4000, () => {
    console.log(`Express server started on port ${process.env.EXPRESS_PORT || 4000}.`)
})
