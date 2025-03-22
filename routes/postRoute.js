const express=require('express');
const router=express.Router();

const mongoose=require('mongoose');
const protectedResource = require('../middleware/protectedResource');
const PostModel=mongoose.model("PostModel");

router.get('/posts',(req,res)=>{
    PostModel.find()
    .populate("author","_id fullName")
    .then((dbPosts)=>{
        res.status(200).json({posts:dbPosts})
    })
    .catch((error)=>{
        console.log('yo');
        console.log(error);
    });
});

//whatever we pass to protected route as db user will be forwarded to this endpoint
router.get('/myposts',protectedResource,(req,res)=>{
    PostModel.find({author : req.dbUser._id })
    .populate("author","_id fullName")
    .then((dbPosts)=>{
        res.status(200).json({posts:dbPosts})
    })
    .catch((error)=>{
        console.log('yo');
        console.log(error);
    });
});
router.post('/createpost',protectedResource,(req,res)=>{
    const {title,body,image}=req.body;
    if(!title || !body || !image){
        return res.status(400).json({error:"one or more required fields are empty"});//i dont want to continue furthur after encountering this error
    }
     //console.log(req.dbUser);
      //res.send("Done");
      req.dbUser.password=undefined//should not send the password
    const post=new PostModel({title:title,body:body,image:image ,author:req.dbUser})//make post object

    post.save()
    .then((dbPost)=>{
        res.status(201).json({post:dbPost})
    })
    .catch((error)=>{
        console.log(error);
    });
});
module.exports=router;
