const express=require('express');
const router=express.Router();

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
    res.json({result:"successful registration"});
        
});
module.exports=router;