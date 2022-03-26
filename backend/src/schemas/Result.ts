import mongoose from "mongoose"

// Create a Schema that defines a result in any of the Farming Mode collections.
// A result would indicate how many items dropped at that specific time as described in the date property.
// This would be sent as a POST request whenever the Loot Collection process detects 1+ item drops after each run.
const result = new mongoose.Schema({
    userID: {
        type: String,
        unique: true,
    },
    amount: {
        type: Number,
        default: 1,
    },
    date: {
        type: String,
    },
})

export default mongoose.model("Result", result)
