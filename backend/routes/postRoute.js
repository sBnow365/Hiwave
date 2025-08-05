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


router.post('/createpost', protectedResource, (req, res) => {
    const { title, body, mediaUrl, mediaType, pollOptions, pollExpiresAt } = req.body;

    if (!title || !body) {
        return res.status(400).json({ error: "Title and body are required" });
    }

    // Validate poll data if provided
    if (pollOptions) {
        if (!Array.isArray(pollOptions) || pollOptions.length < 2) {
            return res.status(400).json({ error: "Poll must have at least 2 options" });
        }
        if (pollOptions.length > 10) {
            return res.status(400).json({ error: "Poll cannot have more than 10 options" });
        }
        if (pollOptions.some(option => !option.trim())) {
            return res.status(400).json({ error: "Poll options cannot be empty" });
        }
    }

    // Validate media if provided
    if (mediaUrl && mediaType) {
        if (!["image", "video"].includes(mediaType)) {
            return res.status(400).json({ error: "Invalid media type. Must be 'image' or 'video'" });
        }
    }

    req.dbUser.password = undefined; // should not send the password

    const postData = {
        title: title,
        body: body,
        author: req.dbUser
    };

    // Add media if provided
    if (mediaUrl && mediaType) {
        postData.mediaUrl = mediaUrl;
        postData.mediaType = mediaType;
    }

    // Add poll if provided
    if (pollOptions) {
        postData.poll = {
            options: pollOptions.map(option => ({
                text: option.trim(),
                votes: []
            })),
            expiresAt: pollExpiresAt ? new Date(pollExpiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
            totalVotes: 0
        };
    }

    const post = new PostModel(postData);

    post.save()
        .then((dbPost) => {
            res.status(201).json({ post: dbPost });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ error: "Failed to create post" });
        });
});

router.put('/vote', protectedResource, (req, res) => {
    const { postId, optionIndex } = req.body;

    if (!postId || optionIndex === undefined) {
        return res.status(400).json({ error: "Post ID and option index are required" });
    }

    PostModel.findById(postId)
        .populate("author", "_id fullName profilePicUrl")
        .then((post) => {
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (!post.poll) {
                return res.status(400).json({ error: "This post does not have a poll" });
            }

            // Check if poll has expired
            if (post.poll.expiresAt && new Date() > post.poll.expiresAt) {
                return res.status(400).json({ error: "Poll has expired" });
            }

            // Validate option index
            if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
                return res.status(400).json({ error: "Invalid option index" });
            }

            const userId = req.dbUser._id.toString();

            // Check if user has already voted
            const hasVoted = post.poll.options.some(option => 
                option.votes.some(vote => vote.toString() === userId)
            );

            if (hasVoted) {
                return res.status(400).json({ error: "You have already voted on this poll" });
            }

            // Add vote
            post.poll.options[optionIndex].votes.push(req.dbUser._id);
            post.poll.totalVotes += 1;

            post.save()
                .then((updatedPost) => {
                    res.json({ 
                        message: "Vote recorded successfully", 
                        post: updatedPost 
                    });
                })
                .catch((error) => {
                    console.error("Error saving vote:", error);
                    res.status(500).json({ error: "Failed to record vote" });
                });
        })
        .catch((error) => {
            console.error("Error finding post:", error);
            res.status(500).json({ error: "Internal server error" });
        });
});

// Change vote on poll
router.put('/changevote', protectedResource, (req, res) => {
    const { postId, newOptionIndex } = req.body;

    if (!postId || newOptionIndex === undefined) {
        return res.status(400).json({ error: "Post ID and new option index are required" });
    }

    PostModel.findById(postId)
        .populate("author", "_id fullName profilePicUrl")
        .then((post) => {
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (!post.poll) {
                return res.status(400).json({ error: "This post does not have a poll" });
            }

            // Check if poll has expired
            if (post.poll.expiresAt && new Date() > post.poll.expiresAt) {
                return res.status(400).json({ error: "Poll has expired" });
            }

            // Validate option index
            if (newOptionIndex < 0 || newOptionIndex >= post.poll.options.length) {
                return res.status(400).json({ error: "Invalid option index" });
            }

            const userId = req.dbUser._id.toString();

            // Find and remove existing vote
            let oldVoteFound = false;
            post.poll.options.forEach(option => {
                const voteIndex = option.votes.findIndex(vote => vote.toString() === userId);
                if (voteIndex !== -1) {
                    option.votes.splice(voteIndex, 1);
                    oldVoteFound = true;
                }
            });

            if (!oldVoteFound) {
                return res.status(400).json({ error: "You haven't voted on this poll yet" });
            }

            // Add new vote
            post.poll.options[newOptionIndex].votes.push(req.dbUser._id);

            post.save()
                .then((updatedPost) => {
                    res.json({ 
                        message: "Vote changed successfully", 
                        post: updatedPost 
                    });
                })
                .catch((error) => {
                    console.error("Error changing vote:", error);
                    res.status(500).json({ error: "Failed to change vote" });
                });
        })
        .catch((error) => {
            console.error("Error finding post:", error);
            res.status(500).json({ error: "Internal server error" });
        });
});

// Get poll results
router.get('/poll/:postId', protectedResource, (req, res) => {
    const { postId } = req.params;

    PostModel.findById(postId)
        .populate("author", "_id fullName profilePicUrl")
        .populate("poll.options.votes", "_id fullName profilePicUrl")
        .then((post) => {
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (!post.poll) {
                return res.status(400).json({ error: "This post does not have a poll" });
            }

            // Calculate poll statistics
            const pollResults = {
                ...post.poll.toObject(),
                isExpired: post.poll.expiresAt && new Date() > post.poll.expiresAt,
                userVote: null
            };

            // Find user's vote if any
            const userId = req.dbUser._id.toString();
            pollResults.options.forEach((option, index) => {
                if (option.votes.some(vote => vote._id.toString() === userId)) {
                    pollResults.userVote = index;
                }
            });

            // Calculate percentages
            pollResults.options = pollResults.options.map(option => ({
                ...option,
                voteCount: option.votes.length,
                percentage: post.poll.totalVotes > 0 ? 
                    Math.round((option.votes.length / post.poll.totalVotes) * 100) : 0
            }));

            res.json({ 
                poll: pollResults,
                post: {
                    _id: post._id,
                    title: post.title,
                    body: post.body,
                    author: post.author
                }
            });
        })
        .catch((error) => {
            console.error("Error fetching poll:", error);
            res.status(500).json({ error: "Internal server error" });
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
    .then((result) => {  //  Fix: 'result' is the first argument
        res.json(result);
    })
    .catch((error) => {  // Fix: Handle errors properly
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
