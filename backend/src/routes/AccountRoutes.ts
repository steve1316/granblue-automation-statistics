import express, { Router, Request, Response, NextFunction } from "express"
import passport from "passport"
import bcrypt from "bcryptjs"
import { UserInterface } from "../interfaces/UserInterface"
import User from "../schemas/User"
import { ResultInterface } from "../interfaces/ResultInterface"
import Item from "../schemas/Item"
import Result from "../schemas/Result"

const router: Router = express.Router()

// This middleware makes sure that user is an admin before continuing executing the route.
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

// POST route to register a new user.
router.post("/api/register", async (req: Request, res: Response) => {
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
router.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).send("Successfully authenticated user.")
})

// GET route to get the logged in user.
router.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).send(req.user)
    } else {
        res.status(401).send("Not Authenticated.")
    }
})

// GET route to log out the user.
router.get("/api/logout", (req, res) => {
    req.logout()
    res.status(200).send("Successfully logged out.")
})

// PUT route to delete a user and all of their associated results.
router.put("/api/delete-user/:username", isAdminMiddleware, async (req, res) => {
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

export default router
