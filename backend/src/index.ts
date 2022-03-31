import { ResultInterface } from "./interfaces/ResultInterface"
import { ItemInterface } from "./interfaces/ItemInterface"
import bcrypt from "bcryptjs"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express, { NextFunction, Request, Response } from "express"
import mongoose, { MongooseError } from "mongoose"
import passport from "passport"
import passportLocal from "passport-local"
import session from "express-session"
import User from "./schemas/User"
import { UserInterface } from "./interfaces/UserInterface"
import Item from "./schemas/Item"
import Result from "./schemas/Result"

require("dotenv").config()

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

// Makes sure that user is an admin before continuing executing the route.
const isAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { user }: any = req

    if (!user) {
        res.status(401).send("No user provided.")
    } else {
        User.findOne({ username: user.username }, (err: Error, doc: UserInterface) => {
            if (err) throw err

            if (doc?.isAdmin) {
                next()
            } else {
                res.status(401).send("User is not an admin.")
            }
        })
    }
}

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
    if (!username || !password || typeof username !== "string" || typeof password !== "string" || typeof email !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    // Check if user already exists.
    User.findOne({ username }, async (err: Error, doc: UserInterface) => {
        if (err) throw err

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

            // Save the new User to the users collection.
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

// POST route to create an item if it does not already exist.
app.post("/create-item/:farmingMode/:itemName", async (req, res) => {
    const { farmingMode, itemName } = req.params
    if (!farmingMode || !itemName || typeof farmingMode !== "string" || typeof itemName !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Item.findOne({ itemName: itemName }, async (err: Error, doc: ItemInterface) => {
        if (err) throw err

        if (doc) {
            res.status(201).send("Item already exists.")
        } else {
            // Create the new Item object to the items collection.
            const newItem = new Item({
                itemName: itemName,
                farmingMode: farmingMode,
            })

            // Save the new Item.
            await newItem.save()
            res.status(201).send(`Successfully created item ${itemName}.`)
        }
    }).clone()
})

// GET route to fetch multiple items via the Farming Mode.
app.get("/get-item/farmingMode/:farmingMode", async (req, res) => {
    const { farmingMode } = req.params
    if (!farmingMode || typeof farmingMode !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Item.find({ farmingMode: farmingMode }, (err: Error, docs: ItemInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(200).send(`No Items have been created for Farming Mode ${farmingMode} yet.`)
        }
    }).clone()
})

// GET route to fetch an item via the item name.
app.get("/get-item/farmingMode/:farmingMode/:itemName", async (req, res) => {
    const { farmingMode, itemName } = req.params
    if (!farmingMode || !itemName || typeof farmingMode !== "string" || typeof itemName !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Item.findOne({ farmingMode: farmingMode, itemName: itemName }, (err: Error, doc: ItemInterface) => {
        if (err) throw err

        if (doc) {
            res.status(200).send(doc)
        } else {
            res.status(200).send(`Item ${itemName} does not exist for Farming Mode ${farmingMode}.`)
        }
    }).clone()
})

// POST route to create a new result for an item. The bot at this point has already checked if the item exists before calling this.
app.post("/create-result/:username/:itemName/:platform/:amount", async (req, res) => {
    const { username, itemName, platform, amount } = req.params
    if (!username || !itemName || !platform || !amount || typeof username !== "string" || typeof itemName !== "string" || typeof platform !== "string" || typeof amount !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    } else if (Number(amount) === NaN) {
        res.status(400).send("Improper value for the item amount.")
        return
    }

    await User.findOne({ userID: username }, async (err: Error, doc: UserInterface) => {
        if (err) throw err

        if (doc) {
            // Create the new Result object.
            let date = new Date()
            const newResult = new Result({
                userID: username,
                itemName: itemName,
                amount: amount,
                platform: platform,
                date: `${date.getUTCMonth() + 1}.${date.getUTCDate()}.${date.getUTCFullYear()}`,
            })

            // Save the new Result to the results collection.
            await newResult.save()

            // Now update the total amount for this item.
            await Item.updateOne({ itemName: itemName }, { $inc: { totalAmount: amount } }).exec()
            res.status(201).send("Successfully sent the result and updated the total amount.")
        } else {
            res.status(404).send("User does not exist.")
        }
    }).clone()
})

// GET route to fetch multiple results via user ID.
app.get("/get-result/user/:username", async (req, res) => {
    const { username } = req.params
    if (!username || typeof username !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Result.find({ userID: username }, (err: Error, docs: ResultInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(200).send("No results have been posted yet for this user.")
        }
    }).clone()
})

// GET route to fetch multiple results via the item name.
app.get("/get-result/item/:itemName", async (req, res) => {
    const { itemName } = req.params
    if (!itemName || typeof itemName !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Result.find({ itemName: itemName }, (err: Error, docs: ResultInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(200).send(`No results have been posted yet for this item ${itemName}.`)
        }
    }).clone()
})

app.put("/delete-user/:username", isAdminMiddleware, async (req, res) => {
    const { username } = req.params
    if (!username || typeof username !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await User.deleteOne({ userID: username }).exec()
    console.log(`User ${username} has been successfully deleted. Now proceeding to remove all records belonging to them...`)

    // Decrement from the totals of items that the user had results for.
    let amountToDelete: { [key: string]: number } = {}
    await Result.find({ userID: username }, async (err: Error, docs: ResultInterface[]) => {
        if (err) throw err

        if (docs) {
            docs.forEach((doc) => {
                // Check if the key exists.
                if (amountToDelete[doc.itemName]) {
                    amountToDelete[doc.itemName] += doc.amount
                } else {
                    amountToDelete[doc.itemName] = doc.amount
                }
            })

            // Delete all of the user's data.
            await Result.deleteMany({ userID: username }).exec()
            console.log(`Deleted records for user ${username}.`)

            // Update the amounts of the items affected.
            Object.keys(amountToDelete).forEach(async (key) => {
                await Item.updateOne({ itemName: key }, { $dec: { totalAmount: amountToDelete[key] } }).exec()
                console.log(`Total amount updated for item: ${key}.`)
            })

            console.log("Updated total amounts in items affected.")
            res.status(200).send(`User and their data have been successfully deleted.`)
        } else {
            res.status(200).send(`User successfully deleted.`)
        }
    }).clone()
})

////////////////////
// Start the Express server on the specified port.
app.listen(expressPort, () => {
    console.log(`Express server started on port ${expressPort}.`)
})
