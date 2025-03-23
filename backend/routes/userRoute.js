const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const protectedResource = require('../middleware/protectedResource');
const PostModel=mongoose.model("PostModel");
const UserModel=mongoose.model("UserModel");

//we can also make this route protected later
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
router.put('/follow',protectedResource,(req,res)=>{//check breacket structure
    //req.body.followed=userId of not logged in user
    UserModel.findByIdAndUpdate(req.body.followId,{//push into not logged in's account my user id when x follow's him
        $push:{followers :req.dbUser}
    },{
        new:true
    },(error,result)=>{
        if(error){
            return res.status(400).json({error:error})
        }
        UserModel.findByIdAndUpdate(req.dbUser.id,{
            $push:{following :req.body.followId}
        },{new:true})
        .select("-password")
        .then(result => res.json(result))
        .catch(error=>{
            return res.status(400).json({error:error})
        })
    })
});
router.put('/unfollow',protectedResource,(req,res)=>{//check breacket structure
    //req.body.followed=userId of not logged in user
    UserModel.findByIdAndUpdate(req.body.followId,{//push into not logged in's account my user id when x follow's him
        $pull:{followers :req.dbUser}
    },{
        new:true
    },(error,result)=>{
        if(error){
            return res.status(400).json({error:error})
        }
        UserModel.findByIdAndUpdate(req.dbUser.id,{
            $pull:{following :req.body.followId}
        },{new:true})
        .select("-password")
        .then(result => res.json(result))
        .catch(error=>{
            return res.status(400).json({error:error})
        })
    })
});
module.exports=router;