const {Router} = require('express');
const { userAuth } = require('../middlewares/userAuth');
const { purchaseModel, courseModel } = require('../models/db');

const courseRouter = Router();

courseRouter.post("/purchase", userAuth,async (req,res)=>{
    const userId = req.userId;

    const courseId = req.body.courseId;

    try{
        await purchaseModel.create({
            userId : userId,
            courseId : courseId
        })
        res.json({
            message : "course purchased successfully"
        })
    }catch{
        res.status(403).json({
            message : "Internal server error"
        })
    }
})

// gets all courses => no need of authenetication here
courseRouter.get("/",async (req,res)=>{
    const courses = await courseModel.find({});
    res.json({
        courses : courses
    });

})

module.exports = {
    courseRouter : courseRouter
}