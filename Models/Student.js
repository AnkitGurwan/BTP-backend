import dotenv from "dotenv";
dotenv.config({path:"config/.env"});

import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    rollNum:{type:String, required:true},
    projectName:{type:mongoose.Schema.Types.ObjectId, default:"000000000000000000000000"},
    partner:{type:mongoose.Schema.Types.ObjectId, default:"000000000000000000000000"},
    is_banned:{type:Boolean,required:true,default:false},
})

const Student = mongoose.model("Student",studentSchema);
export default Student;