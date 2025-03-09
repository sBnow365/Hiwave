const express=require('express');
const app=express();
const mongoose=require('mongoose'); 
const PORT=3000;

const {MONGODB_URI}=require('./config');
require('./models/user_model'); //not exported right now
//use middleware

app.use(express.json());//will convert everything that comes from middleware into json
app.use(require('./routes/authentication'));

mongoose.connect(MONGODB_URI);

mongoose.connection.on('connected',()=>{
console.log("connected");
});

mongoose.connection.on('error',(error)=>{
    console.log("some error",error);
});

app.listen(PORT, ()=>{
    console.log("server started");
})
