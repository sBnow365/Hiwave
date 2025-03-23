const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const protectedResource = require('../middleware/protectedResource');
const PostModel=mongoose.model("PostModel");
const UserModel=mongoose.model("UserModel");

//endpoint to get user details of another user(not the logged in user) along with their posts 
router.get('/user/:userId',(req,res)=>{

    //to find the specific user
    UserModel.findOne({_id:req.params.userid})
    .select("-password")//fetch everything except password
    .then((userFound)=>{
      PostModel.find({author:req.params.userId})
      .populate("author","_id fullname")
      .exec((error,allPosts)=>{
        if(error){
            return res.status(400).json({error:error});//i dont want to continue furthur after encountering this error
        }
        res.json({user :userFound,posts:allPosts})
      })
    })
    .catch((error)=>{
        return res.status(400).json({error:"User was not found"})
    })

})

module.exports=router;