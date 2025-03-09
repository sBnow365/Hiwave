const mongoose=require('mongoose')// to import the modules

const userSchema=new mongoose.Schema({
    fullName:{
        type:String,
        reuired:true
    },
    email:{
        type:String,
        reuired:true
    },
    password:{
        type:String,
        reuired:true
    }
})