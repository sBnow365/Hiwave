const mongoose = require('mongoose'); // Import mongoose first

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicUrl: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/128/1946/1946429.png", // Default profile image
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }], // Correct ObjectId reference
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }]  // Correct ObjectId reference
});

// Export the model (this should come after defining schema)
const UserModel = mongoose.model("UserModel", userSchema);
module.exports = UserModel;
