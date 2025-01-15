const { Router } = require('express');
const { userModel, purchaseModel, courseModel } = require('../models/db');
const bcrypt = require('bcrypt');
const {z} = require('zod');
const jwt = require('jsonwebtoken');
const { userAuth } = require('../middlewares/userAuth');
const JWT_USER_SECRET = process.env.JWT_USER_SECRET;

const userRouter = Router();

userRouter.post("/signup",async (req,res)=>{
    // Step 1 : Input validation
    /* req.body = { email : String , password : String, firstName : String, lastName : String */
    const reqBodySchema = z.object({
        email : z.string().email(),
        password : z
            .string()
            .min(3)
            .max(100)
            .refine((password)=>{
                const hasUpperCase = /[A-Z]/.test(password);
                const hasLowerCase = /[a-z]/.test(password);
                const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                return hasUpperCase && hasLowerCase && hasSpecialCharacter;
            },{
                message : "Password must have atleast one upper case , one lower case , and one special character"
            }),
        firstName : z.string().min(3).max(50),
        lastName : z.string().min(3).max(50)
    })

    const {success , data , error} = reqBodySchema.safeParse(req.body);

    if(!success){
        res.status(403).json({ message : "Invalid format ", error : error});
        return;
    }

    const {email , password , firstName, lastName} = req.body;

    
    try{
        // Step 2 : These four lines is not required since my schema has unique constraint but its better to include
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: "Email is already registered" });
            return;
        }

        // Step 3 : Store in db
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.create({
            email : email,
            password : hashedPassword,
            firstName : firstName,
            lastName : lastName
        })

        res.json({message : "Sign up is successful"});
    }catch(err){
        res.status(403).json({message : err.message});
        return;
    }
})

userRouter.post("/signin",async (req,res)=>{
     // Step 1 : Input validation
    const emailSchema = z.string().email();
    const passwordSchema = z
            .string()
            .min(3)
            .max(100)
            .refine((password)=>{
                const hasUpperCase = /[A-Z]/.test(password);
                const hasLowerCase = /[a-z]/.test(password);
                const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                return hasUpperCase && hasLowerCase && hasSpecialCharacter;
            },{
                message : "Password must have atleast one upper case , one lower case , and one special character"
            })
    
    const reqBodySchema = z.object({
        email : emailSchema,
        password : passwordSchema
    })

    const {success, data ,error } = reqBodySchema.safeParse(req.body);

    if(!success){
        res.status(403).json({ message : "Invalid format ", error : error.errors});
        return;
    }

    const { email , password } = req.body;

    try{
        // Step 2 : Check whether the admin exist in the db
        const user = await userModel.findOne({
            email : email
        })
        if (!user) {
            res.status(404).json({ message: "user not found" });
            return;
        }
        
        // Step 3 : Check whether the password matches
        const passwordMatch = await bcrypt.compare(password,user.password);
        if(!passwordMatch){
            res.status(403).json({message : "password is incorrect"});
            return;
        }

        // Step 4 : generate a jwt token and return it
        const token = jwt.sign({
            id : user._id.toString()
        }, JWT_USER_SECRET);

        res.json({ token : token});
    }catch(err){
        console.log(err);
        res.status(403).json({message : "internal server error"});
    }
})

userRouter.get("/purchases",userAuth, async (req,res)=>{
    const userId = req.userId;
    try{
        const purchasedCourses = await purchaseModel.find({
            userId : userId
        })

        const coursesData = await courseModel.find({
            _id : {$in : purchasedCourses.map((purchasedCourse) => purchasedCourse.courseId)}
        })

        res.json({
            coursesData
        });

    }catch(err){
        console.log(err);
        res.status(403).json({message : "internal server error"});
    }
})

module.exports = {
    userRouter : userRouter
}
