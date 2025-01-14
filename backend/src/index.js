const express = require('express');
require('dotenv').config({path : "../.env"});
const mongoose = require('mongoose');
const { userRouter } = require('./routes/user');
const { courseRouter } = require('./routes/course');
const { adminRouter } = require('./routes/admin');

const app = express();

app.use("api/v1/user", userRouter);
app.use("api/v1/course",courseRouter);
app.use("api/v1/admin",adminRouter);

const startServer = async ()=>{
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    app.listen(3000, function(){
        console.log("Server is listening on port 3000");
    });
}

startServer();
