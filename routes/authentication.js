const express=require('express');
const router=express.Router();

const mongoose=require('mongoose');
const UserModel=mongoose.model("UserModel");

const bcrypt=require('bcryptjs');

router.get('/',(req,res)=>{
    res.send("Hello from sashwat");
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