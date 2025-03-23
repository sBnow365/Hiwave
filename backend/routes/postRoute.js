const express=require('express');
const router=express.Router();

const mongoose=require('mongoose');
const protectedResource = require('../middleware/protectedResource');
const PostModel=mongoose.model("PostModel");

router.get('/posts',protectedResource,(req,res)=>{
    PostModel.find()
    .populate("author","_id fullName profilePicUrl")
    .populate("comments.commentedBy","_id fullName profilePicUrl")    
    .then((dbPosts)=>{
        res.status(200).json({posts:dbPosts})
    })
    .catch((error)=>{
        console.log('yo');
        console.log(error);
    });
});

router.get('/postsfromfollowing',protectedResource,(req,res)=>{
    PostModel.find({author:{$in:req.dbUser.following}})//return posts of not everyone kind of for loop
    .populate("author","_id fullName profilePicUrl")
    .populate("comments.commentedBy","_id fullName profilePicUrl")    
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
    .populate("author","_id fullName profilePicUrl")
    .populate("comments.commentedBy","_id fullName profilePicUrl")    
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
//implementing like endpoint
router.put('/like',protectedResource,(req,res)=>{
    PostModel.findByIdAndUpdate(req.body.postId,{
        //likes is an array we have to push
        $push:{likes: req.dbUser._id}
    },{
        new:true    //return  updated record

    })
    .populate("author","_id fullName")
    .exec((error,result)=>{
        if(error){
            return res.status(400).json({error:error});
        }else{
            res.json(result);
        }
    })//querymodel find post then update with who liked it
})

router.put('/unlike',protectedResource,(req,res)=>{
    PostModel.findByIdAndUpdate(req.body.postId,{
        //likes is an array we have to pull
        $pull:{likes: req.dbUser._id}
    },{
        new:true    //return  updated record

    })
    .populate("author","_id fullName")
    .exec((error,result)=>{
        if(error){
            return res.status(400).json({error:error});
        }else{
            res.json(result);
        }
    })//querymodel find post then update with who liked it
})
router.put('/comment',protectedResource,(req,res)=>{
    
    const comment={
        commentText:req.body.commentText,
        commentedBy:req.dbUser._id
    };

    PostModel.findByIdAndUpdate(req.body.postId,{
        //likes is an array we have to pull
        $push:{comments: comment }
    },{
        new:true    //return  updated record

    })
    .populate("comments.commentedBy","_id fullName")
    .populate("author","_id fullName")
    .exec((error,result)=>{
        if(error){
            return res.status(400).json({error:error});
        }else{
            res.json(result);
        }
    })//querymodel find post then update with who liked it
})
router.delete("/deletepost/:postId",protectedResource,(req,res)=>{
    PostModel.findOne({_id:req.params.postId})
    .populate("author","_id")
    exec((error,post)=>{
        if(error || !post){
            return res.status(400).json({error:error});
        }
        if(post.author._id.toString()===req.dbUser._id.toString()){
            post.remove()
            .then((data)=>{
                res.json({result:"post deleted successfully"})
            })
            .catch((e)=>{
                console.log(e);
                
            })
        }
    })
})
module.exports=router;
