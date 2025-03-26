const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const protectedResource = require('../middleware/protectedResource');
const PostModel=mongoose.model("PostModel");
const UserModel=mongoose.model("UserModel");

//we can also make this route protected later
//endpoint to get user details of another user(not the logged in user) along with their posts 


router.get('/user/:userId', protectedResource, async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching user with userId:', userId);

        // ✅ Validate if userId is a valid MongoDB ObjectId
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        // ✅ Find user and exclude password
        const userFound = await UserModel.findById(userId).select('-password');
        if (!userFound) {
            console.log('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        // ✅ Find posts by user with populate (latest Mongoose syntax)
        const posts = await PostModel.find({ author: userId }).populate('author', '_id fullName');

        // ✅ Send structured response
        res.status(200).json({ user: userFound, posts });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/follow', protectedResource, async (req, res) => {
    const { followId } = req.body; // User to be followed

    if (!followId) {
        return res.status(400).json({ error: 'FollowId is required' });
    }

    try {
        // Add the logged-in user to the followed user's followers list
        await UserModel.findByIdAndUpdate(
            followId,
            { $push: { followers: req.dbUser.id } },
            { new: true }
        );

        // Add the followed user to the logged-in user's following list
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.dbUser.id,
            { $push: { following: followId } },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        console.error("Error in follow route:", error);
        res.status(500).json({ error: error.message });
    }
});


// Endpoint for unfollowing a user
router.put('/unfollow', protectedResource, async (req, res) => {
    const { unfollowId } = req.body; // User to be unfollowed

    if (!unfollowId) {
        return res.status(400).json({ error: 'UnfollowId is required' });
    }

    try {
        // Remove the logged-in user from the unfollowed user's followers list
        await UserModel.findByIdAndUpdate(
            unfollowId,
            { $pull: { followers: req.dbUser.id } },
            { new: true }
        );

        // Remove the unfollowed user from the logged-in user's following list
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.dbUser.id,
            { $pull: { following: unfollowId } },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        console.error("Error in unfollow route:", error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
