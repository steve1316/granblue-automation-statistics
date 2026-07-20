import express, { Router } from "express"
import Item from "../schemas/Item"
import Result from "../schemas/Result"
import User from "../schemas/User"
import { requireAuth } from "../middleware/requireAuth"
import { requireStringParams } from "../middleware/validateBody"
import * as xml2js from "xml2js"

const router: Router = express.Router()

// POST route to create a new result for an item. The bot at this point has already checked if the item exists before calling this.
router.post("/api/create-result", requireAuth, async (req, res) => {
    const { appVersion } = req.body
    let returnNow = false
    if (appVersion) {
        const { platform } = req.body
        if (platform === "GA") {
            await fetch("https://raw.githubusercontent.com/steve1316/granblue-automation-pyautogui/main/src-tauri/update.json")
                .then(async (jsonRes) => {
                    if (jsonRes.status !== 200) {
                        res.status(400).send({message: `Cannot fetch current desktop app version due to status code ${jsonRes.status}.`})
                        returnNow = true
                    }

                    await jsonRes.json().then((data: any) => {
                        if (appVersion !== data.version) {
                            res.status(401).send({message: "Wrong App version for GA."})
                            returnNow = true
                        }
                    })
                })
                .catch((err) => {
                    res.status(400).send(`Cannot fetch current desktop app version using link with error: ${err}`)
                    returnNow = true
                })
        } else if (platform === "GAA") {
            await fetch("https://raw.githubusercontent.com/steve1316/granblue-automation-android/main/android/app/update.xml")
                .then(async (xmlRes) => {
                    if (xmlRes.status !== 200) {
                        res.status(400).send(`Cannot fetch current mobile app version due to status code ${xmlRes.status}.`)
                        returnNow = true
                    }

                    // Convert XML to JSON object.
                    const xmlText = await xmlRes.text()
                    xml2js.parseString(xmlText, (err, result) => {
                        if (err) {
                            res.status(500).send({message: "Failed to parse the XML to JSON when reading in the mobile app version."})
                            returnNow = true
                        } else if (appVersion !== result.AppUpdater.update[0].latestVersion[0]) {
                            res.status(401).send({message: "Wrong App version for GAA."})
                            returnNow = true
                        }
                    })
                })
                .catch((err) => {
                    res.status(400).send(`Cannot fetch current mobile app version using link with error: ${err}`)
                    returnNow = true
                })
        } else {
            res.status(400).send({message: "API request came from an supported platform."})
            returnNow = true
        }
    }

    if (returnNow) {
        return
    }

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
        res.status(400).send({message: "Improper values for parameters."})
        return
    } else if (Number.isNaN(Number(amount))) {
        res.status(400).send({message: "Improper value for the item amount."})
        return
    }

    const doc = await User.findOne({ username: username })
    if (doc) {
        // Create the new Result object.
        let date = new Date()
        let newElapsedTime = "00:00:00"
        if (elapsedTime !== "0.0" && elapsedTime !== "0") {
            newElapsedTime = elapsedTime
        }

        const newResult = new Result({
            username: username,
            itemName: itemName,
            amount: amount,
            platform: platform,
            farmingMode: farmingMode,
            mission: mission,
            date: `${date.toISOString()}`,
            elapsedTime: newElapsedTime,
        })

        // Save the new Result to the results collection.
        await newResult.save()

        // Now update the total amount for this item.
        await Item.updateOne({ itemName: itemName, farmingMode: farmingMode, mission: mission }, { $inc: { totalAmount: amount } }).exec()
        console.log(`Successfully created result of ${amount}x ${itemName} of ${mission} for ${farmingMode} Farming Mode at ${date} for ${username}.`)
        res.status(201).send({message: `Successfully created result of ${amount}x ${itemName} of ${mission} for ${farmingMode} Farming Mode.`})
    } else {
        res.status(404).send({message: "User does not exist."})
    }
})

// GET route to fetch multiple results via user ID.
router.get("/api/get-result/user/:username", requireAuth, async (req, res) => {
    const { username } = req.params
    if (!requireStringParams(res, { username })) return

    const docs = await Result.find({ username: username })
    res.status(200).send(docs)
})

// GET route to fetch multiple results via the item name.
router.get("/api/get-result/item/:itemName", requireAuth, async (req, res) => {
    const { itemName } = req.params
    if (!requireStringParams(res, { itemName })) return

    let sort = req.query.sort
    if (sort === undefined) {
        sort = "desc"
    }

    const newSort = sort === "asc" ? 1 : -1

    const docs = await Result.find({ itemName: itemName }).sort({ _id: newSort })
    res.status(200).send(docs)
})

// GET route to fetch multiple results via the Farming Mode.
router.get("/api/get-result/farmingMode/:farmingMode", requireAuth, async (req, res) => {
    const { farmingMode } = req.params
    if (!requireStringParams(res, { farmingMode })) return

    const docs = await Result.find({ farmingMode: farmingMode })
    res.status(200).send(docs)
})

// GET route to fetch multiple results via the Farming Mode's Mission.
router.get("/api/get-result/farmingMode/:farmingMode/mission/:mission", requireAuth, async (req, res) => {
    const { farmingMode, mission } = req.params
    if (!requireStringParams(res, { farmingMode, mission })) return

    const docs = await Result.find({ farmingMode: farmingMode, mission: mission })
    res.status(200).send(docs)
})

// GET route to fetch multiple results via just the Mission.
router.get("/api/get-result/mission/:mission", requireAuth, async (req, res) => {
    const { mission } = req.params
    if (!requireStringParams(res, { mission })) return

    const docs = await Result.find({ mission: mission })
    res.status(200).send(docs)
})

router.get("/api/get-result", requireAuth, async (req, res) => {
    let sort = req.query.sort
    if (sort === undefined) {
        sort = "desc"
    }

    const newSort = sort === "asc" ? 1 : -1

    const docs = await Result.find().sort({ _id: newSort })
    res.status(200).send(docs)
})

export default router
