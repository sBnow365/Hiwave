mongoose.model("UserModel",userSchema);

const mongoose = require('mongoose'); // Import mongoose

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
    profilePicUrl :{
        type:String,
        default :"https://res-console.cloudinary.com/dku7k2gnt/thumbnails/v1/image/upload/v1742651631/c2FtcGxlcy9sb2dv/drilldown"//if no image given
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }], // Fix ObjectId reference
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }]  // Fix ObjectId reference
});

// Export the model
module.exports = mongoose.model("UserModel", userSchema);
