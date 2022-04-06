import express, { Router } from "express"
import { ItemInterface } from "../interfaces/ItemInterface"
import Item from "../schemas/Item"

const router: Router = express.Router()

// POST route to create an item if it does not already exist.
router.post("/api/create-item/farmingMode/:farmingMode/:itemName", async (req, res) => {
    const { farmingMode, itemName } = req.params
    if (!farmingMode || !itemName || typeof farmingMode !== "string" || typeof itemName !== "string") {
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
            })

            // Save the new Item.
            await newItem.save()
            res.status(201).send(`Successfully created item ${itemName}.`)
        }
    }).clone()
})

// GET route to fetch multiple items via the Farming Mode.
router.get("/api/get-item/farmingMode/:farmingMode", async (req, res) => {
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

export default router
