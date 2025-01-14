const { Router } = require('express');

const userRouter = Router();

userRouter.post("signup",(req,res)=>{

})

userRouter.post("/user/signin",(req,res)=>{

})

userRouter.get("/user/purchases",(req,res)=>{

})

module.exports = {
    userRouter : userRouter
}
