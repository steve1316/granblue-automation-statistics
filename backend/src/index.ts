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
mongoose.connect(`mongodb+srv://steve1316:${process.env.MONGODB_PASSWORD}@cluster0.bms87.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, (err: MongooseError) => {
    if (err) throw err
    console.log("Connected to MongoDB Cluster.")
})

////////////////////
// Middleware
const expressPort = 4000
const app = express()
app.use(express.json())
app.use(cors({ origin: ["http://localhost:3000", "https://granblue-automation-statistics.com"], credentials: true })) //
app.use(
    session({
        secret: "secretcode",
        resave: true,
        saveUninitialized: true,
    })
)
app.use(cookieParser())
app.use(passport.initialize())
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
app.listen(expressPort, () => {
    console.log(`Express server started on port ${expressPort}.`)
})
