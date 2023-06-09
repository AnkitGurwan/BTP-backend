import dotenv from "dotenv";
dotenv.config({path:"backend/config/.env"});

import express from "express";
import Project from "../Models/Project.js";
import Student from "../Models/Student.js";
import User from "../Models/User.js";
// import User from "../Models/User.js";

import XLSX from "xlsx";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const extract_projects = async (projects_array) => {
    var projects = [];

    for (var i = 0; i < projects_array.length; i++) {
        let project = await Project.findById(projects_array[i]).select("-password -seckey").lean();;
        projects.push(project);
    }

    return projects;
}


const intrestedPeople = async (arrayOfProjects) => {
    var result = [];

if(arrayOfProjects){
    for (let i = 0; i < arrayOfProjects.length; i++) {
        const project = await Project.findById(arrayOfProjects[i]);
        if (project) {
            for (let j = 0; j < 2; j++) {
                let people = await Student.find({email:project.intrestedPeople[j]}).select("-password -seckey -is_banned -is_admin -role -_id -projectName ");
                let people2 = await Student.find({email:project.intrestedPeople[j]}).select("-password -seckey -is_banned -is_admin -role -_id -projectName -partner -token -__v");
                if(people)
                var partner = await Student.findById(people.partner);
                if(partner && people2)
                people2.partner_name = partner.name;
                if(project && people2)
                people2.project_name = project.title;
                result.push(people2);
            }
        }
    }
}

    return result;
}

const newproject = async (req, res) => {

    const user_email = req.user.id;

    const isvaliD = await User.findOne({ email: user_email });

    if (!isvaliD) {
        res.status(400).json({ msg: "Not Allowed" });
    }

    else {
        var today = new Date();
        const d = new Date();


        function addZero(i) {
            if (i < 10) { i = "0" + i }
            return i;
        }


        let h = addZero(d.getHours());
        let m = addZero(d.getMinutes());
        let s = addZero(d.getSeconds());
        let time = h + ":" + m + ":" + s;
        var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
        var full = (today.getMonth() + 1) + " " + today.getDate() + ", " + today.getFullYear() + " " + time;
        let co_supervisor = "";
        if (req.body.co_supervisor) {
            co_supervisor = req.body.co_supervisor;
        }

        const newItem = await Project.create({
            title: req.body.title,
            brief_abstract: req.body.brief_abstract,
            co_supervisor: co_supervisor,
            specialization: req.body.specialization,
            ownerDetails: isvaliD._id,
            creation_date: date,
            creation_time: time,
            updation_date: "",
            updation_time: "",
            getfull: full,
        })

        const addProject = await User.findByIdAndUpdate(isvaliD._id, { $push: { projects_posted: newItem._id } })   // Push the intrestedPeople array in the Items.

        res.status(200).json({ msg: "Success" });
    }

}

const newStudent = async (req, res) => {

    const isValid = await Student.findOne({ email: req.body.userEmail });
    console.log("user",isValid)
    console.log("step3")

    if(!isValid){
        console.log("step4")
        await Student.create({
        name: req.body.user1name,
        email: req.body.user1email,
        rollNum: req.body.user1roll,
        projectName: '000000000000000000000000',
        partner: '000000000000000000000000',
        is_banned: false,   
    })}
    
    console.log("step5")
        res.status(200).json({ msg: "Success" });
    }

// const getallstudent= async (req, res) => {
//     const isvaliD1 = await Student.findOne({ email: req.params.email });
//     if(isvaliD1 && isvaliD1.partner!='000000000000000000000000')
//     var isvaliD2 = await Student.findById(isvaliD1.partner );

//     if(isvaliD2)
//     res.status(200).json(isvaliD2);
// }
const getallstudent = async (req, res) => {
    const students = await Student.find();
    res.status(200).json(students);
}



const updateProjectDetails = async (req, res) => {
    const project_id = req.params.id;
    const isProject = await Project.findById(project_id);

    if (!isProject) {
        res.status(400).json({ "msg": "failure" });
    }

    else {
        const user = req.user.id;
        const isUser = await User.findOne({ email: user });

        if (!isUser) {
            res.status(401).json({ msg: "User Not Exist" });
        }

        else if (String(isProject.ownerDetails) !== String(isUser._id)) {               // If Item found but doesn't belongs to the logged in user.
            res.status(403).send("This Item Doesn't Belongs to You.");
        }
        else {
            let title = isProject.title;
            let brief_abstract = isProject.brief_abstract;
            let co_supervisor = "";
            let specialization = isProject.specialization;

            if (isProject.co_supervisor) {
                co_supervisor = isProject.co_supervisor;
            }


            if (req.body.title) {
                title = req.body.title;
            }
            if (req.body.brief_abstract) {
                brief_abstract = req.body.brief_abstract
            }
            if (req.body.co_supervisor) {
                co_supervisor = req.body.co_supervisor;
            }
            if (req.body.specialization) {
                specialization = req.body.specialization;
            }

            var today = new Date();
            const d = new Date();


            function addZero(i) {
                if (i < 10) { i = "0" + i }
                return i;
            }


            let h = addZero(d.getHours());
            let m = addZero(d.getMinutes());
            let s = addZero(d.getSeconds());
            let time = h + ":" + m + ":" + s;
            var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
            var full = (today.getMonth() + 1) + " " + today.getDate() + ", " + today.getFullYear() + " " + time;

            let updation_date = date;
            let updation_time = time;

            const updation_project = await Project.findByIdAndUpdate(isProject._id, {
                title: title,
                brief_abstract: brief_abstract,
                co_supervisor: co_supervisor,
                specialization: specialization,
                updation_date: updation_date,
                updation_time: updation_time,
            })

            res.status(200).json({ msg: "success" });
        }

    }
}



const deleteProject = async (req, res) => {
   
    const user = await User.findOne({ email: req.user.id });
    const pId = req.params.id;
    const project = await Project.findById(pId);

    if (!project) {
        res.status(404).json({ msg: "Not Found" });
    }
    else if (String(project.ownerDetails) !== String(user._id)) {               // If Item found but doesn't belongs to the logged in user.
        res.status(403).send("This Item Doesn't Belongs This You.");
    }

    else {
        if (project.intrestedPeople.length !== 0) {
            const stud1 = await Student.find({email:project.intrestedPeople[0]});
            const stud2 = await Student.findOne({email:project.intrestedPeople[1]});
            const deltostudu1 = await Student.findOneAndUpdate({email:project.intrestedPeople[0]}, { projectName: "000000000000000000000000", partner: "000000000000000000000000" })
            const deltostudu2 = await Student.findOneAndUpdate({email:project.intrestedPeople[1]}, { projectName: "000000000000000000000000", partner: "000000000000000000000000" })
            const deltointrestedpeople = await Project.findByIdAndUpdate(project._id, { $pull: { intrestedPeople: stud1.email } })
            const deltointrestedpeople2 = await Project.findByIdAndUpdate(project._id, { $pull: { intrestedPeople: stud2.email } })
        }

        const isDeleted = await Project.findByIdAndDelete(pId);
        const delProject = await User.findByIdAndUpdate(user._id, { $pull: { projects_posted: project._id } })   // Push the intrestedPeople array in the Items.
        res.status(200).json({ msg: "Success" });

    }
}

const getOwnerDeltails = async (req, res) => {
    const id = req.params.id;

    const project = await Project.findById(id);
    
    if (!project) {
        res.status(404).json({ msg: "Not Found" });
    }

    else {
        const user = await User.findById(project.ownerDetails);
        if (!user) {
            res.status(403).json({ msg: "Owner Not Found" });
        }
        else {
            res.status(200).json(user);
            
        }
    }
}
const getprojectDetails = async (req, res) => {
    const id = req.params.id;

    const project = await Project.findById(id);
    
    if (!project) {
        res.status(404).json({ msg: "Not Found" });
    }

    else {
       
            res.status(200).json(project);

    }
}


const getAllItems = async (req, res) => {
    const projects = await Project.find();
    res.status(200).json(projects);
}


const selectProject = async (req, res) => {
    console.log("uuuuiiiii")
   
    const pId = req.params.id;
    const project = await Project.findById(pId);

    const partner_email = req.params.email;

    if (!req.params.email || req.params.user===req.params.partner_email) {
        res.status(350).json({ "msg": "Please Select A Partner" })
    }

    if (project.intrestedPeople.length !== 0) {
        res.status(400).json({ msg: "Project Already Alloted." });
    }


    else {
        
        const user = await Student.findOne({ email: req.params.user });
        if(user)
        var User = await Student.findById(user._id);
        
        const other_user = partner_email;
        const isValidUser = await Student.findOne({ email: other_user });

        if (User && (String(User.projectName) !== ("000000000000000000000000"))) {
            res.status(401).json({ msg: "Project Already Alloted To You." })
        }
        else if (isValidUser) {
            
            if (String(isValidUser.projectName) !== "000000000000000000000000") {
                res.status(401).json({ msg: "Project Already Alloted To Partner." })
            }
            else {
                
                if(isValidUser && project && User){
                   
                const addtostudu1 = await Student.findByIdAndUpdate(User._id, { projectName: project._id, partner: isValidUser._id })
                const addtostudu2 = await Student.findByIdAndUpdate(isValidUser._id, { projectName: project._id, partner: User._id })
                const addtointrestedpeople = await Project.findByIdAndUpdate(project._id, { $push: { intrestedPeople: User.email } })
                const addtointrestedpeople2 = await Project.findByIdAndUpdate(project._id, { $push: { intrestedPeople: isValidUser.email } })
                }
                res.status(200).json({ msg: "Success" });
            }
        }
        else {
            res.status(403).json({ msg: "Partner Not Exists" });
        }

    }
    
}

const deselectProject = async (req, res) => {

    const pId = req.params.id;
    const project = await Project.findById(pId);

    if (project) {
        if (project.intrestedPeople.length === 0) {
            res.status(400).json({ msg: "No Project Alloted Yet." });
        }


        else {
            
            const user = await Student.findOne({ email: req.params.user })



            if (user&&String(user.projectName) !== String(project._id)) {
                res.status(401).json({ msg: "This Project is not alloted to you." })
            }


            else {
                if(project && user){
                const partner = await Student.findById(user.partner);
                const deltostudu1 = await Student.findByIdAndUpdate(user._id, { projectName: "000000000000000000000000", partner: "000000000000000000000000" })
                const deltostudu2 = await Student.findByIdAndUpdate(partner._id, { projectName: "000000000000000000000000", partner: "000000000000000000000000" })
                const deltointrestedpeople = await Project.findByIdAndUpdate(project._id, { $pull: { intrestedPeople: user.email } })
                const deltointrestedpeople2 = await Project.findByIdAndUpdate(project._id, { $pull: { intrestedPeople: partner.email } })
                res.status(200).json({ msg: "Success" });
            }
        }


        }
    }

    else{
        res.status(405).json({msg:"Failure"});
    }


}


const getPostedProjects = async (req, res) => {
    const email = req.user.id;
    const user = await User.findOne({ email });
    
    if (!user) {
        res.status(200).json({ msg: "User Not Found" });
    }

    else {
        const projects = user.projects_posted;
        const projects_array = await extract_projects(projects);
        res.status(200).json(projects_array);
    }
}



const downLoadDetails = async (req, res, next) => {
    console.log("0")
    var wb = XLSX.utils.book_new();
    const user = req.params.email;
    const isValidUser = await User.findOne({ email: user });
    console.log("1")
    
    if(isValidUser)
    var arrayOfProjects = isValidUser.projects_posted;


    var details = await intrestedPeople(arrayOfProjects);
    var temp = JSON.stringify(details);
    temp = JSON.parse(temp);
    var ws = XLSX.utils.json_to_sheet(temp);

    console.log("2")

    var down = __dirname + `/public/student_data.xlsx`;
    XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
    XLSX.writeFile(wb, down);
    res.status(200).download(down);
    console.log("ready to download",details)
    // res.status(200).json(details);
}




export { newproject,newStudent,getallstudent, updateProjectDetails, deleteProject, getOwnerDeltails, getAllItems, selectProject, deselectProject, getPostedProjects, downLoadDetails,getprojectDetails };