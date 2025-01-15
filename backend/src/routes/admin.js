const {Router} = require('express');
const {adminModel, courseModel} = require('../models/db');
const jwt = require('jsonwebtoken');
const {z} = require('zod');
const bcrypt = require('bcrypt');
const { adminAuth } = require('../middlewares/adminAuth');

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

adminRouter.get("/course",adminAuth, async (req,res)=>{
    const adminId = req.adminId;

    try{
        const courses = await courseModel.find({
            creatorId : adminId
        })

        res.json({
            courses : courses
        })
    }catch(err){
        res.status(403).json({message : "internal server error"});
    }
})

adminRouter.post("/course",adminAuth,async (req,res)=>{
    const adminId = req.adminId;
    const {title , description , price, imageUrl } = req.body;

    try{
        const course = await courseModel.create({
            title : title, 
            description : description,
            price : price, 
            imageUrl : imageUrl,
            creatorId : adminId
        })

        res.json({message : "Course created successfully ", courseId : course._id})
    }catch(err){
        res.json({message : "Internal server error"});
    }
})

adminRouter.put("/course",adminAuth,async (req,res)=>{
    const adminId = req.adminId;

    const {title, description, price, imageUrl, courseId} = req.body;

    try{
        const course = await courseModel.findOne({
            _id : courseId
        })

        if(course.creatorId.toString() !== adminId){
            res.status(403).json({
                message : "You cannnot update the course created by someone else."
            })
            return;
        }

        const updatedCourse = await courseModel.updateOne({
            _id : courseId,
            creatorId : adminId // this is not needed as i have checked before this but still ...
        },{
            title : title, 
            description : description, 
            price: price, 
            imageUrl : imageUrl
        })

        res.json({
            message : "Course Updated",
            courseId : updatedCourse._id
        })
    }catch(err){
        console.log(err.message);
        res.status(403).json({message : "Internal server error"});
    }

})

adminRouter.delete("/course",adminAuth,async (req,res)=>{
    const adminId = req.adminId;
    const {courseId} = req.body;

    try{
        const course = await courseModel.findOne({
            _id : courseId
        })

        if(course.creatorId.toString() !== adminId){
            res.status(403).json({
                message : "You cannnot delete the course created by someone else."
            })
            return;
        }

        await courseModel.deleteOne({
            _id : courseId
        })

        res.json({
            message : "course deleted successfully"
        })
    }catch(err){
        req.status(403).json({
            message : "internal server error"
        })
    }
})

module.exports = {
    adminRouter : adminRouter
}