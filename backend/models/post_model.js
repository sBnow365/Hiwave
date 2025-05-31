const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    mediaUrl: {
        type: String
    },
    mediaType: {
        type: String,
        enum: ["image", "video"]
    },
    // Poll schema
    poll: {
        options: [{
            text: { 
                type: String, 
                required: true 
            },
            votes: [{ 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'UserModel' 
            }]
        }],
        expiresAt: { 
            type: Date 
        },
        totalVotes: { 
            type: Number, 
            default: 0 
        }
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    }],
    comments: [{
        commentText: String,
        commentedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserModel"
        }
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    }
}, { timestamps: true });

mongoose.model("PostModel", postSchema);