const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
    email : {type : String , required : true, unique : true},
    password : {type : String , required : true},
    firstName : {type : String , required : true},
    lastName : String
})

const adminSchema = new Schema({
    email : {type : String , required : true, unique : true},
    password : {type : String , required : true},
    firstName : {type : String , required : true},
    lastName : String
})

const courseSchema = new Schema({
    title : {type : String , required : true},
    description : String,
    price : {type : Number , required : true},
    imageUrl : String,
    creatorId : ObjectId
})

const purchaseSchema = new Schema({
    courseId : ObjectId,
    userId : ObjectId
})

const userModel = mongoose.model('users',userSchema);
const adminModel = mongoose.model('admins',adminSchema);
const courseModel = mongoose.model('courses',courseSchema);
const purchaseModel = mongoose.model('purchases',purchaseSchema);

module.exports = {
    userModel,
    adminModel,
    courseModel,
    purchaseModel
};

