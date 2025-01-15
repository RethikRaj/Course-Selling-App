const jwt = require('jsonwebtoken');
require('dotenv').config({path : "../../.env"});

const JWT_USER_SECRET  = process.env.JWT_USER_SECRET;

function userAuth (req,res,next){
    const token = req.headers.authorization;
    try{
        const decodedInfo = jwt.verify(token,JWT_USER_SECRET);
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