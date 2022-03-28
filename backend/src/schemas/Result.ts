import mongoose from "mongoose"

// Create a Schema that defines a result.
// A result would indicate how many items dropped at that specific time as described in the date property.
// This would be sent as a POST request whenever the Loot Collection process detects 1+ item drops after each run.
// A result can be searched via the unique user ID or by searching for the item name.
const result = new mongoose.Schema({
    userID: {
        type: String,
    },
    itemName: {
        type: String,
    },
    amount: {
        type: Number,
        default: 1,
    },
    platform: {
        type: String,
    },
    date: {
        type: String,
    },
})

export default mongoose.model("Result", result)
