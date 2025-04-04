require('dotenv').config();
const express=require('express');
const app=express();
const mongoose=require('mongoose'); 
const PORT=4000;

const {MONGODB_URI}=require('./config');

mongoose.connect(MONGODB_URI);

mongoose.connection.on('connected',()=>{
console.log("connected");
});

mongoose.connection.on('error',(error)=>{
    console.log("some error",error);
});

require('./models/user_model'); //not exported right now
//use middleware
require('./models/post_model'); //not exported right now

app.use(express.json());//will convert everything that comes from middleware into json
app.use(require('./routes/authentication'));
app.use(require('./routes/postRoute'));
app.use(require('./routes/userRoute'));

const uploadCloud=require('./routes/upload');
app.use('/api',uploadCloud);

app.listen(PORT, ()=>{
    console.log("server started");
})
