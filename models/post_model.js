const mongoose=require('mongoose')// to import the modules
//id of user needs to be connected to post model

const {ObjectId}=mongoose.Schema.Types;

const postSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    author:{
        type:ObjectId,
        ref:"UserModel"
    }

})
mongoose.model("PostModel",postSchema);