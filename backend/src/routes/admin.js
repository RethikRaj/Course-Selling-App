const {Router} = require('express');
const {adminModel} = require('../models/db');
const jwt = require('jsonwebtoken');
const {z} = require('zod');
const bcrypt = require('bcrypt');
require('dotenv').config({path : "../../.env"});
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;

const adminRouter = Router();

adminRouter.post("/signup",async (req,res)=>{
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
        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            res.status(409).json({ message: "Email is already registered" });
            return;
        }

        // Step 3 : Store in db
        const hashedPassword = await bcrypt.hash(password, 10);
        await adminModel.create({
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

adminRouter.post("/signin",async (req,res)=>{
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
        const admin = await adminModel.findOne({
            email : email
        })
        if (!admin) {
            res.status(404).json({ message: "Admin not found" });
            return;
        }
        
        // Step 3 : Check whether the password matches
        const passwordMatch = await bcrypt.compare(password,admin.password);
        if(!passwordMatch){
            res.status(403).json({message : "password is incorrect"});
            return;
        }

        // Step 4 : generate a jwt token and return it
        const token = jwt.sign({
            id : admin._id.toString()
        }, JWT_ADMIN_SECRET);

        res.json({ token : token});
    }catch(err){
        console.log(err);
        res.status(403).json({message : "internal server error"});
    }
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