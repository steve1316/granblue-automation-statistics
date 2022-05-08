import axios from "axios"
import express, { Router } from "express"
import { ItemInterface } from "../interfaces/ItemInterface"
import Item from "../schemas/Item"
import { authenticationWorkaround } from "./AccountRoutes"

const router: Router = express.Router()

// POST route to create an item if it does not already exist.
router.post("/api/create-item", async (req, res) => {
    if (!req.isAuthenticated()) {
        const { username, password } = req?.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send("Not Authenticated.")
            return
        }
    }

    const { farmingMode, mission, itemName } = req.body
    if (!farmingMode || !mission || !itemName || typeof farmingMode !== "string" || typeof mission !== "string" || typeof itemName !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Item.findOne({ farmingMode: farmingMode, itemName: itemName }, async (err: Error, doc: ItemInterface) => {
        if (err) throw err

        if (doc) {
            res.status(201).send("Item already exists.")
        } else {
            // Create the new Item object to the items collection.
            const newItem = new Item({
                itemName: itemName,
                farmingMode: farmingMode,
                mission: mission,
            })

            // Save the new Item.
            await newItem.save()
            console.log(`Successfully created item ${itemName} for ${mission} of ${farmingMode} Farming Mode.`)
            res.status(201).send(`Successfully created item ${itemName} for ${mission} of ${farmingMode} Farming Mode.`)
        }
    }).clone()
})

// GET route to fetch multiple items via the Farming Mode.
router.get("/api/get-item/farmingMode/:farmingMode", async (req, res) => {
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
router.get("/api/get-item/farmingMode/:farmingMode/:itemName", async (req, res) => {
    if (!req.isAuthenticated()) {
        const { username, password } = req?.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send("Not Authenticated.")
            return
        }
    }

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

// GET route to get all items.
router.get("/api/get-item", async (req, res) => {
    if (!req.isAuthenticated()) {
        const { username, password } = req?.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send("Not Authenticated.")
            return
        }
    }

    await Item.find({}, (err: Error, docs: ItemInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(200).send(`No Items found.`)
        }
    }).clone()
})

export default router
