const jwt = require('jsonwebtoken');

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
        res.status(403).json({message : "invalid token"});
    }
}

module.exports = {
    adminAuth
}