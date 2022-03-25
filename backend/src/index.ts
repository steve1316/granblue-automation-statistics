import bcrypt from "bcryptjs"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express, { Request, Response } from "express"
import mongoose, { MongooseError } from "mongoose"
import passport from "passport"
import passportLocal from "passport-local"
import session from "express-session"
import User from "./User"
import { UserInterface } from "./interfaces/UserInterface"

////////////////////
// Connect to MongoDB cluster.
mongoose.connect("mongodb+srv://steve1316:admin@cluster0.bms87.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", (err: MongooseError) => {
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
    // Destructure the username and password fields and perform type validation.
    const { username, password } = req?.body
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        res.send("Improper values for username or password.")
        return
    }

    // Check if user already exists.
    User.findOne({ username }, async (err: Error, doc: UserInterface) => {
        if (err) {
            throw err
        }

        if (doc) {
            res.send("User already exists")
        } else {
            // Hash the user's password.
            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            // Create the new User object.
            const newUser = new User({
                username: req.body.username,
                password: hashedPassword,
            })

            // Save the new User to the collection.
            await newUser.save()

            res.send("Success")
        }
    })
})

// POST route to login via passport authentication.
app.post("/login", passport.authenticate("local"), (req, res) => {
    res.send("Successfully authenticated user.")
})

// GET route to get the logged in user.
app.get("/user", (req, res) => {
    res.send(req.user)
})

////////////////////
// Start the Express server on the specified port.
app.listen(expressPort, () => {
    console.log(`Express server started on port ${expressPort}.`)
})
