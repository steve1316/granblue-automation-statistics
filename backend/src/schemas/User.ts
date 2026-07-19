import mongoose from "mongoose"

// Create a Schema that defines a registered user in the "users" collection.
const user = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        default: "",
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
})

export default mongoose.model("User", user)
