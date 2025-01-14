const jwt = require('jsonwebtoken');
require('dotenv').config({path : "../.env"});

const JWT_SECRET  = process.env.JWT_SECRET;

function userAuth (req,res,next){
    const token = req.headers.authorization;
    try{
        const decodedInfo = jwt.verify(token,JWT_SECRET);
        const id = decodedInfo.id;
        req.userId = id;
        next();
    }catch(err){
        console.log(err.message);
    }
}

module.exports = {
    userAuth
}