const mongoose=require('mongoose')// to import the modules

const userSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    followers:[{type:ObjectId,ref:"UserModel"}],
    following:[{type:ObjectId,ref:"UserModel"}]
})
mongoose.model("UserModel",userSchema);