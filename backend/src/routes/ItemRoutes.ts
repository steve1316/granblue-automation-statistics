import express, { Router } from "express"
import { pool } from "../db"
import { requireAuth } from "../middleware/requireAuth"
import { requireStringParams } from "../middleware/validateBody"

const router: Router = express.Router()

// The columns every item response is built from.
const ITEM_COLUMNS = "id, item_name, farming_mode, mission, total_amount"

// The filters `fetchItems` accepts, mapped to the columns they match on. Only these names ever reach the SQL.
const ITEM_FILTER_COLUMNS = { farmingMode: "farming_mode", mission: "mission", itemName: "item_name" } as const

/** One row of the items table. */
interface ItemRow {
    /** The row's surrogate key. pg returns bigint columns as strings. */
    id: string
    /** The item's name, e.g. "Grimnir Anima". */
    item_name: string
    /** The Farming Mode the item drops in. */
    farming_mode: string
    /** The mission within that Farming Mode. */
    mission: string
    /** Every unit of this item ever submitted for that mission. */
    total_amount: string
}

/**
 * Converts an item row into the exact JSON the old Mongo-backed API returned. `_id` and `__v` are
 * vestigial Mongoose fields, kept because a shipped bot reading either of them would otherwise start
 * seeing undefined.
 *
 * @param row The item row to convert.
 * @returns The item in the API's frozen wire shape.
 */
const toItemResponse = (row: ItemRow) => ({
    _id: String(row.id),
    itemName: row.item_name,
    farmingMode: row.farming_mode,
    mission: row.mission,
    totalAmount: Number(row.total_amount),
    __v: 0,
})

/**
 * Reads every item matching a set of exact-match filters.
 *
 * @param filters Values to match on. A filter that is not set is skipped.
 * @returns The matching items in the API's wire shape.
 */
const fetchItems = async (filters: Partial<Record<keyof typeof ITEM_FILTER_COLUMNS, string>> = {}) => {
    const clauses: string[] = []
    const values: string[] = []
    for (const [key, column] of Object.entries(ITEM_FILTER_COLUMNS)) {
        const value = filters[key as keyof typeof ITEM_FILTER_COLUMNS]
        if (value !== undefined) {
            values.push(value)
            clauses.push(`${column} = $${values.length}`)
        }
    }

    const where = clauses.length > 0 ? `where ${clauses.join(" and ")}` : ""
    const { rows } = await pool.query<ItemRow>(`select ${ITEM_COLUMNS} from items ${where} order by id`, values)
    return rows.map(toItemResponse)
}

// POST route to create an item if it does not already exist. The identity is Farming Mode, mission and
// item name together. The old code looked one up on only two of the three while the running total was
// keyed on all three, which is how the totals drifted apart.
router.post("/api/create-item", requireAuth, async (req, res) => {
    const { farmingMode, mission, itemName } = req.body
    if (!requireStringParams(res, { farmingMode, mission, itemName })) return

    // No pre-flight read. The unique constraint already tells us if it exists.
    const { rowCount } = await pool.query("insert into items (farming_mode, mission, item_name) values ($1, $2, $3) on conflict on constraint items_identity_key do nothing", [farmingMode, mission, itemName])
    if (rowCount === 0) {
        res.status(201).send({ message: "Item already exists." })
        return
    }

    console.log(`Successfully created item ${itemName} for ${mission} of ${farmingMode} Farming Mode.`)
    res.status(201).send({ message: `Successfully created item ${itemName} for ${mission} of ${farmingMode} Farming Mode.` })
})

// GET route to fetch multiple items via the Farming Mode.
router.get("/api/get-item/farmingMode/:farmingMode", requireAuth, async (req, res) => {
    if (!requireStringParams(res, req.params)) return
    const { farmingMode } = req.params

    res.status(200).send(await fetchItems({ farmingMode: farmingMode }))
})

// GET route to fetch multiple items via the Farming Mode and a specific Mission.
router.get("/api/get-item/farmingMode/:farmingMode/mission/:mission", requireAuth, async (req, res) => {
    if (!requireStringParams(res, req.params)) return
    const { farmingMode, mission } = req.params

    res.status(200).send(await fetchItems({ farmingMode: farmingMode, mission: mission }))
})

// GET route to fetch an item via the item name. A miss is a 200 carrying a message rather than a 404,
// so callers discriminate on the shape. That is how it has always behaved.
router.get("/api/get-item/farmingMode/:farmingMode/item/:itemName", requireAuth, async (req, res) => {
    if (!requireStringParams(res, req.params)) return
    const { farmingMode, itemName } = req.params

    const [item] = await fetchItems({ farmingMode: farmingMode, itemName: itemName })
    if (item) {
        res.status(200).send(item)
    } else {
        res.status(200).send({ message: `Item ${itemName} does not exist for Farming Mode ${farmingMode}.` })
    }
})

// GET route to get all items.
router.get("/api/get-item", requireAuth, async (_req, res) => {
    res.status(200).send(await fetchItems())
})

export default router
