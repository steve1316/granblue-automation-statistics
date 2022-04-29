import express, { Router, Request, Response, NextFunction } from "express"
import passport from "passport"
import bcrypt from "bcryptjs"
import { UserInterface } from "../interfaces/UserInterface"
import User from "../schemas/User"
import { ResultInterface } from "../interfaces/ResultInterface"
import Item from "../schemas/Item"
import Result from "../schemas/Result"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import axios from "axios"

const router: Router = express.Router()

// This workaround method is only for the use of Tauri to work around the fact that the headers are stripped in the response when Tauri receives it from the server.
export const authenticationWorkaround = async (username: string, password: string) => {
    await axios
        .post("http://localhost:4000/api/login", { username: username, password: password }, { withCredentials: true })
        .then(() => {
            return true
        })
        .catch(() => {
            return false
        })
}

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
    User.findOne({ username: username }, async (err: Error, doc: UserInterface) => {
        if (err) throw err

        if (doc) {
            res.status(409).send("Username already exists.")
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
    if (!req.isAuthenticated()) {
        const { username, password } = req?.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send("Not Authenticated.")
            return
        }
    }

    res.status(200).send(req.user)
})

// GET route to fetch a user by their username.
router.get("/api/get-user", (req, res) => {
    const { username } = req?.body
    if (!username || typeof username !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    User.findOne({ username: username }, (err: Error, doc: UserInterface) => {
        if (err) throw err

        if (doc) {
            res.status(200).send("User exists.")
        } else {
            res.status(404).send("User does not exists.")
        }
    }).clone()
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

    await User.deleteOne({ username: username }).exec()
    console.log(`User ${username} has been successfully deleted. Now proceeding to remove all records belonging to them...`)

    // Decrement from the totals of items that the user had results for.
    let amountToDelete: { [key: string]: number } = {}
    await Result.find({ username: username }, async (err: Error, docs: ResultInterface[]) => {
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
            await Result.deleteMany({ username: username }).exec()
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

// POST route to start the password recovery process.
router.post("/api/forgot-password", (req, res) => {
    const { recoveryEntryPoint } = req?.body
    if (!recoveryEntryPoint || typeof recoveryEntryPoint !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    const sendEmail = async (doc: UserInterface) => {
        // Create the jwt token.
        const secret = process.env.JWT_SECRET + doc.username
        const payload = {
            email: doc.email,
            username: doc.username,
        }
        const token = jwt.sign(payload, secret, { expiresIn: "60m" })

        try {
            // Create the nodemailer transporter.
            let transporter = nodemailer.createTransport({
                host: "mail.granblue-automation-statistics.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false, // Allow self signed certificate.
                },
            })

            // Construct the link and the body of the email.
            const link = `https://granblue-automation-statistics.com/reset-password/${doc.username}/${token}`
            const body = `Hello ${doc.username},

There was a request to reset your password. You can click the link below to change your password or disregard this email if you did not make this request.

${link}

- Granblue Automation Statistics`

            // Now send the email.
            let email = await transporter.sendMail({
                from: "no-reply@granblue-automation-statistics.com",
                to: doc.email,
                subject: "Password Reset Request",
                text: body,
            })

            console.log("Password reset email sent: ", email.messageId)

            res.status(200).send("Password reset link has been emailed.")
        } catch (err) {
            console.error(err)
            res.status(500).send("Failed to email password reset link.")
        }
    }

    // Check if the entry point is a username.
    User.findOne({ username: recoveryEntryPoint }, (err: Error, doc: UserInterface) => {
        if (err) throw err

        if (doc) {
            sendEmail(doc)
        } else {
            // If username is not found, find email.
            User.findOne({ email: recoveryEntryPoint }, async (err: Error, doc: UserInterface) => {
                if (err) throw err

                if (doc) {
                    sendEmail(doc)
                } else {
                    res.status(404).send("Username/Email does not exist.")
                }
            }).clone()
        }
    }).clone()
})

// POST route to reset a user's password.
router.post("/api/reset-password", async (req, res) => {
    const { username, newPassword } = req?.body
    if (!username || !newPassword || typeof username !== "string" || typeof newPassword !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    // Hash the user's password.
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    User.findOneAndUpdate({ username: username }, { password: hashedPassword }, (err: Error, doc: UserInterface) => {
        if (err) throw err

        if (doc) {
            res.status(200).send("Password updated successfully.")
        } else {
            res.status(404).send("Could not find user to update password for.")
        }
    })
})

// GET route to verify a JWT token from a password reset request.
router.get("/api/verify-token/:username/:token", (req, res) => {
    const { username, token } = req.params

    const secret = process.env.JWT_SECRET + username

    try {
        jwt.verify(token, secret)
        res.status(200).send("Token is valid.")
    } catch (err) {
        console.error("Password reset token expired for: ", username)
        res.status(400).send(err)
    }
})

export default router
