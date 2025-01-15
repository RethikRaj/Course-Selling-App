const jwt = require('jsonwebtoken');
require('dotenv').config({path : "../../.env"});

const JWT_ADMIN_SECRET  = process.env.JWT_ADMIN_SECRET;

function adminAuth(req,res,next){
    const token = req.headers.authorization;
    try{
        const decodedInfo = jwt.verify(token,JWT_ADMIN_SECRET);
        const id = decodedInfo.id;
        req.adminId = id;
        next();
    }catch(err){
        console.log(err.message);
    }
}

module.exports = {
    adminAuth
}