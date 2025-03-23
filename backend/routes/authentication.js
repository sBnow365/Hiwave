const express=require('express');
const router=express.Router();

const mongoose=require('mongoose');
const UserModel=mongoose.model("UserModel");

const bcrypt=require('bcryptjs');

const jwt=require('jsonwebtoken');
const {JWT_SECRET}=require('../config');

const protectedRoute=require('../middleware/protectedResource');
const protectedResource = require('../middleware/protectedResource');


router.get('/',(req,res)=>{
    res.send("Hello from sashwat");
});

router.get('/secured',protectedResource,(req,res)=>{
    res.send("Welcome to secured area");
});


router.post('/login',(req,res)=>{
    const {email,password}=req.body;//destructuring
    if(!email || !password){
        return res.status(400).json({error:"one or more required fields are empty"});//i dont want to continue furthur after encountering this error
    }
    UserModel.findOne({email:email})
    .then((dbUser)=>{
        if(!dbUser){//user not found
            return res.status(400).json({error:"User not found"});//i dont want to continue furthur after encountering this error
        }
        bcrypt.compare(password,dbUser.password)
        .then((didMatch)=>{
            if(didMatch){
                //return res.status(200).json({result:"successful Log IN"});//check what happens if i remove return here
                //create send a token
                const jwtToken=jwt.sign({_id:dbUser._id},JWT_SECRET);
                const {_id,fullName,email}=dbUser
                res.json({token:jwtToken,userInfo: {_id,fullName,email}});//seonding info to the frontend
            }
            else{
                return res.status(400).json({error:"Invalid Credentials"});//i dont want to continue furthur after encountering this error
            }
        })
    })
    .catch((error)=>{
        console.log(error);
    });
});
router.post('/register',(req,res)=>{
    console.log(req.body);
    const {fullName,email,password}=req.body;//object destructuring
    if(!fullName || !email || !password)
    {
        return res.status(400).json({error:"one or more required fields are empty"});//i dont want to continue furthur after encountering this error
    }
    //avoid duplicate users
    UserModel.findOne({email:email})//do mwthid chaining
    .then((dbUser)=>{
        if(dbUser){
            //error message
            res.status(500).json({error:"User with email already exists"});
        }
        bcrypt.hash(password,16)//high alue higher encryption
        .then((hashedPassword)=>{
            
            const user=new UserModel({fullName,email,password:hashedPassword})//var names should be same
            user.save()
            .then((u)=>{
                res.status(201).json({result:"successful registration"});
            })
            .catch((error)=>{
                console.log(error);
            });
        });
        

    })
    .catch((error)=>{
            console.log(error);
            
    });        
});
module.exports=router;