// const mongoose=require('mongoose')// to import the modules

// const userSchema=new mongoose.Schema({
//     fullName:{
//         type:String,
//         required:true
//     },
//     email:{
//         type:String,
//         required:true
//     },
//     password:{
//         type:String,
//         required:true
//     },
//     followers:[{type:ObjectId,ref:"UserModel"}],
//     following:[{type:ObjectId,ref:"UserModel"}]
// })
// mongoose.model("UserModel",userSchema);

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
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }], // Fix ObjectId reference
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }]  // Fix ObjectId reference
});

// Export the model
module.exports = mongoose.model("UserModel", userSchema);
