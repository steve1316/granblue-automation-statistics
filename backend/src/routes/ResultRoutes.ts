import axios from "axios"
import express, { Router } from "express"
import { ResultInterface } from "../interfaces/ResultInterface"
import { UserInterface } from "../interfaces/UserInterface"
import Item from "../schemas/Item"
import Result from "../schemas/Result"
import User from "../schemas/User"
import { authenticationWorkaround } from "./AccountRoutes"

const router: Router = express.Router()

// POST route to create a new result for an item. The bot at this point has already checked if the item exists before calling this.
router.post("/api/create-result/:username/:farmingMode/:itemName/:platform/:amount", async (req, res) => {
    if (!req.isAuthenticated()) {
        const { username, password } = req?.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send("Not Authenticated.")
            return
        }
    }

    const { username, farmingMode, itemName, platform, amount } = req.params
    if (
        !username ||
        !farmingMode ||
        !itemName ||
        !platform ||
        !amount ||
        typeof username !== "string" ||
        typeof farmingMode !== "string" ||
        typeof itemName !== "string" ||
        typeof platform !== "string" ||
        typeof amount !== "string"
    ) {
        res.status(400).send("Improper values for parameters.")
        return
    } else if (Number(amount) === NaN) {
        res.status(400).send("Improper value for the item amount.")
        return
    }

    await User.findOne({ username: username }, async (err: Error, doc: UserInterface) => {
        if (err) throw err

        if (doc) {
            // Create the new Result object.
            let date = new Date()
            const newResult = new Result({
                username: username,
                itemName: itemName,
                amount: amount,
                platform: platform,
                farmingMode: farmingMode,
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
router.get("/api/get-result/user/:username", async (req, res) => {
    if (!req.isAuthenticated()) {
        const { username, password } = req?.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send("Not Authenticated.")
            return
        }
    }

    const { username } = req.params
    if (!username || typeof username !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Result.find({ username: username }, (err: Error, docs: ResultInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(200).send("No results have been posted yet for this user.")
        }
    }).clone()
})

// GET route to fetch multiple results via the item name.
router.get("/api/get-result/item/:itemName", async (req, res) => {
    if (!req.isAuthenticated()) {
        const { username, password } = req?.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send("Not Authenticated.")
            return
        }
    }

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

// GET route to fetch multiple results via the Farming Mode.
router.get("/api/get-result/farmingMode/:farmingMode", async (req, res) => {
    if (!req.isAuthenticated()) {
        const { username, password } = req?.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send("Not Authenticated.")
            return
        }
    }

    const { farmingMode } = req.params
    if (!farmingMode || typeof farmingMode !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Result.find({ farmingMode: farmingMode }, (err: Error, docs: ResultInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(200).send(`No results have been posted yet for the Farming Mode: ${farmingMode}.`)
        }
    }).clone()
})

export default router
