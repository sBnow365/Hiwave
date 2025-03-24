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


module.exports = router;
router.put('/follow', protectedResource, async (req, res) => {
    try {
        const { followId } = req.body;
        const userId = req.dbUser._id;

        if (!followId) {
            return res.status(400).json({ error: "followId is required" });
        }

        // Add logged-in user to the other user's followers
        const updatedUser = await UserModel.findByIdAndUpdate(
            followId,
            { $addToSet: { followers: userId } },  // Prevent duplicates
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Add the other user to the logged-in user's following list
        const currentUser = await UserModel.findByIdAndUpdate(
            userId,
            { $addToSet: { following: followId } },  // Prevent duplicates
            { new: true }
        ).select("-password");

        res.json(currentUser);
    } catch (error) {
        console.error("Error in follow:", error);
        res.status(500).json({ error: error.message });
    }
});


router.put('/unfollow', protectedResource, async (req, res) => {
    try {
        const { followId } = req.body;
        const userId = req.dbUser._id;

        if (!followId) {
            return res.status(400).json({ error: "followId is required" });
        }

        // Remove from the other user's followers list
        const updatedUser = await UserModel.findByIdAndUpdate(
            followId,
            { $pull: { followers: userId } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Remove from the logged-in user's following list
        const currentUser = await UserModel.findByIdAndUpdate(
            userId,
            { $pull: { following: followId } },
            { new: true }
        ).select("-password");

        res.json(currentUser);
    } catch (error) {
        console.error("Error in unfollow:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports=router;