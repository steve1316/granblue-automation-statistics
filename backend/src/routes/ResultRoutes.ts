import express, { Router } from "express"
import { ResultInterface } from "../interfaces/ResultInterface"
import { UserInterface } from "../interfaces/UserInterface"
import Item from "../schemas/Item"
import Result from "../schemas/Result"
import User from "../schemas/User"
import { authenticationWorkaround } from "./AccountRoutes"
import fetch from "cross-fetch"

const router: Router = express.Router()

// POST route to create a new result for an item. The bot at this point has already checked if the item exists before calling this.
router.post("/api/create-result", async (req, res) => {
    if (!req.isAuthenticated()) {
        const { username, password } = req?.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send("Not Authenticated.")
            return
        }
    }

    const { appVersion } = req.body
    if (appVersion) {
        await fetch("https://raw.githubusercontent.com/steve1316/granblue-automation-pyautogui/main/src-tauri/update.json")
            .then((jsonRes) => {
                if (jsonRes.status !== 200) {
                    res.status(400).send(`Cannot fetch current App version due to status code ${jsonRes.status}.`)
                    return
                }

                jsonRes.json().then((data) => {
                    if (appVersion !== data.version) {
                        res.status(400).send("Wrong App version.")
                        return
                    }
                })
            })
            .catch((err) => {
                res.status(400).send(`Cannot fetch current App version using link with error: ${err}`)
                return
            })
    }

    return

    const { username, farmingMode, mission, itemName, platform, amount, elapsedTime } = req.body
    if (
        !username ||
        !farmingMode ||
        !mission ||
        !itemName ||
        !platform ||
        !amount ||
        !elapsedTime ||
        typeof username !== "string" ||
        typeof farmingMode !== "string" ||
        typeof mission !== "string" ||
        typeof itemName !== "string" ||
        typeof platform !== "string" ||
        typeof amount !== "number" ||
        typeof elapsedTime !== "string"
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
                mission: mission,
                date: `${date.toISOString()}`,
                elapsedTime: elapsedTime,
            })

            // Save the new Result to the results collection.
            await newResult.save()

            // Now update the total amount for this item.
            await Item.updateOne({ itemName: itemName, farmingMode: farmingMode, mission: mission }, { $inc: { totalAmount: amount } }).exec()
            console.log(`Successfully created result of ${amount}x ${itemName} of ${mission} for ${farmingMode} Farming Mode at ${date} for ${username}.`)
            res.status(201).send(`Successfully created result of ${amount}x ${itemName} of ${mission} for ${farmingMode} Farming Mode.`)
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
            res.status(200).send(`No results have been posted yet for ${farmingMode} Farming Mode.`)
        }
    }).clone()
})

// GET route to fetch multiple results via the Farming Mode's Mission.
router.get("/api/get-result/farmingMode/:farmingMode/mission/:mission", async (req, res) => {
    if (!req.isAuthenticated()) {
        const { username, password } = req?.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send("Not Authenticated.")
            return
        }
    }

    const { farmingMode, mission } = req.params
    if (!farmingMode || !mission || typeof farmingMode !== "string" || typeof mission !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Result.find({ farmingMode: farmingMode, mission: mission }, (err: Error, docs: ResultInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(200).send(`No results have been posted yet for ${mission} of ${farmingMode} Farming Mode.`)
        }
    }).clone()
})

export default router
