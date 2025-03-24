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