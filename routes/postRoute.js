const express=require('express');
const router=express.Router();

const mongoose=require('mongoose');
const protectedResource = require('../middleware/protectedResource');
const PostModel=mongoose.model("PostModel");


router.post('/createpost',protectedResource,(req,res)=>{
    const {title,body}=req.body;
    if(!title || !body){
        return res.status(400).json({error:"one or more required fields are empty"});//i dont want to continue furthur after encountering this error
    }
     //console.log(req.dbUser);
      //res.send("Done");
      req.dbUser.password=undefined
    const post=new PostModel({title:title,body:body,author:req.dbUser})//make post object

    post.save()
    .then((dbPost)=>{
        res.status(201).json({post:dbPost})
    })
    .catch((error)=>{
        console.log(error);
    });
});
module.exports=router;
