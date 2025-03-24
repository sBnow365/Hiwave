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
router.put('/like', protectedResource, (req, res) => {
    PostModel.findByIdAndUpdate(
        req.body.postId,
        { $push: { likes: req.dbUser._id } }, // Push user ID to likes array
        { new: true } // Return updated document
    )
    .populate("author", "_id fullName")
    .then((result) => {  // ✅ Fix: 'result' is the first argument
        res.json(result);
    })
    .catch((error) => {  // ✅ Fix: Handle errors properly
        console.error("Error in like API:", error);
        res.status(400).json({ error: error.message });
    });
});


router.put('/unlike', protectedResource, (req, res) => {
    PostModel.findByIdAndUpdate(
        req.body.postId,
        { $pull: { likes: req.dbUser._id } }, // ✅ Remove user ID from likes array
        { new: true } // ✅ Return updated document
    )
    .populate("author", "_id fullName")
    .then((result) => { 
        res.json(result);
    })
    .catch((error) => {
        console.error("Error in unlike API:", error);
        res.status(400).json({ error: error.message });
    });
});

router.put("/comment", protectedResource, (req, res) => {
    console.log("Received Comment Request:", req.body); // Debugging log

    const comment = {
        commentText: req.body.commentText,
        commentedBy: req.dbUser._id
    };

    PostModel.findByIdAndUpdate(
        req.body.postId,
        { $push: { comments: comment } },
        { new: true }
    )
    .populate("comments.commentedBy", "_id fullName")
    .populate("author", "_id fullName")
    .then((result) => {
        console.log("Updated Post with Comment:", result); // Debugging log
        res.json(result);
    })
    .catch((error) => {
        console.error("Error in Comment API:", error);
        res.status(400).json({ error: error.message });
    });
});

router.delete("/deletepost/:postId", protectedResource, (req, res) => {
    console.log("Received delete request for Post ID:", req.params.postId);
    console.log("Authenticated User:", req.dbUser);

    PostModel.findOne({ _id: req.params.postId })
        .populate("author", "_id")
        .then(post => {
            if (!post) {
                console.log("Post not found in database.");
                return res.status(404).json({ error: "Post not found" });
            }

            console.log("Post Author ID:", post.author._id.toString());
            console.log("Request User ID:", req.dbUser._id.toString());

            if (post.author._id.toString() !== req.dbUser._id.toString()) {
                console.log("Unauthorized deletion attempt.");
                return res.status(403).json({ error: "Unauthorized action" });
            }

            PostModel.deleteOne({ _id: req.params.postId })
                .then(() => {
                    res.json({ message: "Post deleted successfully" });
                })
                .catch(error => {
                    console.error("Error deleting post:", error);
                    res.status(500).json({ error: "Internal server error" });
                });
        })
        .catch(error => {
            console.error("Error finding post:", error);
            res.status(500).json({ error: "Internal server error" });
        });
});

router.delete("/deletecomment/:postId/:commentId", protectedResource, (req, res) => {
    const { postId, commentId } = req.params;

    PostModel.findById(postId)
        .populate("comments.commentedBy", "_id") // Ensure author data is available
        .then(post => {
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            // Find comment to delete
            const comment = post.comments.find(c => c._id.toString() === commentId);
            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            // Check if the logged-in user is the author of the comment
            if (comment.commentedBy._id.toString() !== req.dbUser._id.toString()) {
                return res.status(403).json({ error: "Unauthorized action" });
            }

            // Remove comment from the post's comments array
            post.comments = post.comments.filter(c => c._id.toString() !== commentId);

            // Save updated post
            post.save()
                .then(updatedPost => {
                    res.json({ message: "Comment deleted successfully", updatedPost });
                })
                .catch(error => {
                    console.error("Error saving post after deleting comment:", error);
                    res.status(500).json({ error: "Internal server error" });
                });
        })
        .catch(error => {
            console.error("Error finding post:", error);
            res.status(500).json({ error: "Internal server error" });
        });
});



module.exports=router;
