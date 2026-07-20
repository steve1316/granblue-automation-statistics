import express, { Router } from "express"
import Item from "../schemas/Item"
import { requireAuth } from "../middleware/requireAuth"
import { requireStringParams } from "../middleware/validateBody"

const router: Router = express.Router()

// POST route to create an item if it does not already exist.
router.post("/api/create-item", requireAuth, async (req, res) => {
    const { farmingMode, mission, itemName } = req.body
    if (!requireStringParams(res, { farmingMode, mission, itemName })) return

    const doc = await Item.findOne({ farmingMode: farmingMode, itemName: itemName })
    if (doc) {
        res.status(201).send({message: "Item already exists."})
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
        res.status(201).send({message: `Successfully created item ${itemName} for ${mission} of ${farmingMode} Farming Mode.`})
    }
})

// GET route to fetch multiple items via the Farming Mode.
router.get("/api/get-item/farmingMode/:farmingMode", requireAuth, async (req, res) => {
    const { farmingMode } = req.params
    if (!requireStringParams(res, { farmingMode })) return

    const docs = await Item.find({ farmingMode: farmingMode })
    res.status(200).send(docs)
})

// GET route to fetch multiple items via the Farming Mode and a specific Mission.
router.get("/api/get-item/farmingMode/:farmingMode/mission/:mission", requireAuth, async (req, res) => {
    const { farmingMode, mission } = req.params
    if (!requireStringParams(res, { farmingMode, mission })) return

    const docs = await Item.find({ farmingMode: farmingMode, mission: mission })
    res.status(200).send(docs)
})

// GET route to fetch an item via the item name.
router.get("/api/get-item/farmingMode/:farmingMode/item/:itemName", requireAuth, async (req, res) => {
    const { farmingMode, itemName } = req.params
    if (!requireStringParams(res, { farmingMode, itemName })) return

    const doc = await Item.findOne({ farmingMode: farmingMode, itemName: itemName })
    if (doc) {
        res.status(200).send(doc)
    } else {
        res.status(200).send({message: `Item ${itemName} does not exist for Farming Mode ${farmingMode}.`})
    }
})

// GET route to get all items.
router.get("/api/get-item", requireAuth, async (req, res) => {
    const docs = await Item.find({})
    res.status(200).send(docs)
})

export default router
