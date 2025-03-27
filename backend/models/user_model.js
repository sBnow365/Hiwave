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
        default: "https://m.media-amazon.com/images/M/MV5BODk3OWIyY2MtM2E0MS00OWYyLTlkNDktMzY4MTE1MDhiYzBiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg" // Default profile image
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }], // Correct ObjectId reference
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }]  // Correct ObjectId reference
});

// Export the model (this should come after defining schema)
const UserModel = mongoose.model("UserModel", userSchema);
module.exports = UserModel;
