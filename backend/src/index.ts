import bcrypt from "bcryptjs"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express, { Request, Response } from "express"
import mongoose, { MongooseError } from "mongoose"
import passport from "passport"
import passportLocal from "passport-local"
import session from "express-session"
import User from "./schemas/User"
import { UserInterface } from "./interfaces/UserInterface"

require("dotenv").config()

////////////////////
// Connect to MongoDB cluster.
mongoose.connect(`mongodb+srv://steve1316:${process.env.MONGODB_PASSWORD}@cluster0.bms87.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, (err: MongooseError) => {
    if (err) {
        throw err
    }
    console.log("Connected to MongoDB Cluster.")
})

////////////////////
// Middleware
const expressPort = 4000
const app = express()
app.use(express.json())
app.use(cors({ origin: "http://localhost:3000", credentials: true }))
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
            if (err) {
                throw err
            }

            if (!user) {
                return done(null, false)
            } else {
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
    cb(null, user.id)
})
passport.deserializeUser((id: string, cb) => {
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

// POST route to register a new user.
app.post("/register", async (req: Request, res: Response) => {
    // Destructure the username, password and email fields and perform type validation.
    const { username, password, email } = req?.body
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        res.status(400).send("Improper values for username or password.")
        return
    } else if (typeof email !== "string") {
        res.status(400).send("Improper value for email.")
        return
    }

    // Check if user already exists.
    User.findOne({ username }, async (err: Error, doc: UserInterface) => {
        if (err) {
            throw err
        }

        if (doc) {
            res.status(409).send("User ID already exists.")
        } else {
            // Hash the user's password.
            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            // Create the new User object.
            const newUser = new User({
                username: req.body.username,
                password: hashedPassword,
                email: email,
            })

            // Save the new User to the collection.
            await newUser.save()
            res.status(201).send("Successfully created user.")
        }
    })
})

// POST route to login via passport authentication.
app.post("/login", passport.authenticate("local"), (req, res) => {
    res.status(200).send("Successfully authenticated user.")
})

// GET route to get the logged in user.
app.get("/user", (req, res) => {
    res.status(200).send(req.user)
})

// GET route to log out the user.
app.get("/logout", (req, res) => {
    req.logout()
    res.status(200).send("Successfully logged out.")
})

////////////////////
// Start the Express server on the specified port.
app.listen(expressPort, () => {
    console.log(`Express server started on port ${expressPort}.`)
})
