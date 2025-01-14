const {Router} = require('express');
const {adminModel} = require('../models/db');

const adminRouter = Router();

adminRouter.post("/signup",(req,res)=>{

})

adminRouter.post("/signin",(req,res)=>{
    
})

adminRouter.get("/course",(req,res)=>{
    
})

adminRouter.post("/course",(req,res)=>{
    
})

adminRouter.put("/course",(req,res)=>{
    
})

adminRouter.delete("/course",(req,res)=>{
    
})

module.exports = {
    adminRouter : adminRouter
}