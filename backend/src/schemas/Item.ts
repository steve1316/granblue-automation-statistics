import mongoose from "mongoose"

// Create a Schema that defines a item in the "items" collection. If the item already exists, then do not create it again.
// Many items can be searched by joining via the Farming Mode.
const item = new mongoose.Schema({
    itemName: {
        type: String,
        unique: true,
    },
    farmingMode: {
        type: String,
    },
    totalAmount: {
        type: Number,
        default: 0,
    },
})

export default mongoose.model("Item", item)
