import dotenv from "dotenv";
dotenv.config({ path: "config/.env" });

import Project from "../Models/Project.js";
import Student from "../Models/Student.js";
import User from "../Models/User.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import excelJS from "exceljs";

import { sendEmail } from "./userController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const extract_projects = async (projects_array) => {
    var projects = [];

    for (var i = 0; i < projects_array.length; i++) {
        let project = await Project.findById(projects_array[i]).select("-password -seckey").lean();
        projects.push(project);
    }
    return projects;
}

const intrestedPeople = async (arrayOfProjects) => {
    var result = [];

    if (arrayOfProjects) {
        for (let i = 0; i < arrayOfProjects.length; i++) {
            var student = [];
            const project = await Project.findById(arrayOfProjects[i]);
            if (project) {
                for (let j = 0; j < 2; j++) {
                    let people2 = await Student.find({ email: project.intrestedPeople[j] }).select("-password -seckey -is_banned -is_admin -role -_id -partner -token -__v");
                    people2.project_name = project.title;

                    student.push(people2);
                }
            }
            result.push(student);
        }
    }
    return result;
}

const newproject = async (req, res) => {
    const user_email = req.user.id;

    const isvaliD = await User.findOne({ email: user_email });

    if (!isvaliD) {
        res.status(400).json({ msg: "Not Allowed" });
    } else {
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
        });
        const addProject = await User.findByIdAndUpdate(isvaliD._id, { $push: { projects_posted: newItem._id } });
        res.status(200).json({ msg: "Success" });
    }
}

const newStudent = async (req, res) => {
    const isValid = await Student.findOne({ email: req.body.userEmail });

    if (!isValid) {
        await Student.create({
            name: req.body.userName,
            email: req.body.userEmail,
            rollNum: req.body.userRoll,
            projectName: '000000000000000000000000',
            partner: '000000000000000000000000',
            is_banned: false,
        });
    }
    res.status(200).json({ msg: "Success" });
}

const getallstudent = async (req, res) => {
    const students = await Student.find();
    res.status(200).json(students);
}

const getSpecificProject = async (req, res) => {
    const project = await Project.findById(req.params.id);
    res.status(200).json(project);
}

const updateProjectDetails = async (req, res) => {
    const project_id = req.params.id;
    const isProject = await Project.findById(project_id);

    if (!isProject) {
        res.status(400).json({ "msg": "failure" });
    } else {
        const user = req.user.id;
        const isUser = await User.findOne({ email: user });

        if (!isUser) {
            res.status(401).json({ msg: "User Not Exist" });
        } else if (String(isProject.ownerDetails) !== String(isUser._id)) {
            res.status(403).send("This Item Doesn't Belongs to You.");
        } else {
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
                brief_abstract = req.body.brief_abstract;
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
                if (i < 10) { i = "0" + i; }
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
            });

            res.status(200).json({ msg: "success" });
        }
    }
}

// ... (Continuation of the code, if any)



const deleteProject = async (req, res) => {
    const user = await User.findOne({ email: req.user.id });
    const pId = req.params.id;
    const project = await Project.findById(pId);

    if (!project) {
        res.status(404).json({ msg: "Not Found" });
    } else if (String(project.ownerDetails) !== String(user._id)) {
        res.status(403).send("This Item Doesn't Belong to You.");
    } else {
        if (project.intrestedPeople.length !== 0) {
            const stud1 = await Student.find({ email: project.intrestedPeople[0] });
            const stud2 = await Student.findOne({ email: project.intrestedPeople[1] });
            const deltostudu1 = await Student.findOneAndUpdate({ email: project.intrestedPeople[0] }, { projectName: "000000000000000000000000", partner: "000000000000000000000000" });
            const deltostudu2 = await Student.findOneAndUpdate({ email: project.intrestedPeople[1] }, { projectName: "000000000000000000000000", partner: "000000000000000000000000" });
            const deltointrestedpeople = await Project.findByIdAndUpdate(project._id, { $pull: { intrestedPeople: stud1.email } });
            const deltointrestedpeople2 = await Project.findByIdAndUpdate(project._id, { $pull: { intrestedPeople: stud2.email } });
        }

        const isDeleted = await Project.findByIdAndDelete(pId);
        const delProject = await User.findByIdAndUpdate(user._id, { $pull: { projects_posted: project._id } });
        res.status(200).json({ msg: "Success" });
    }
};

const getOwnerDetails = async (req, res) => {
    const id = req.params.id;
    const project = await Project.findById(id);

    if (!project) {
        res.status(404).json({ msg: "Not Found" });
    } else {
        const user = await User.findById(project.ownerDetails);
        if (!user) {
            res.status(403).json({ msg: "Owner Not Found" });
        } else {
            res.status(200).json(user);
        }
    }
};

const getProjectDetails = async (req, res) => {
    const id = req.params.id;
    const project = await Project.findById(id);

    if (!project) {
        res.status(404).json({ msg: "Not Found" });
    } else {
        res.status(200).json(project);
    }
};

const getProjectName = async (reqId) => {
    const id = reqId;
    const project = await Project.findById(id);
    // console.log("project", project);

    return project.title;
};

const checkRegistered = async (req, res) => {
    // console.log(User)
    
    const accessToken = req.params.accessToken;
    // console.log(accessToken)

    const url = 'https://graph.microsoft.com/v1.0/me';

    const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const email = data.mail;

        // console.log(email)
        
        const student = await Student.find({ email: email });

        let flag = false;

        if (student && student[0] && String(student[0].projectName) !== "000000000000000000000000") {
            flag = true;
        }

        // console.log(flag)

        if (flag) res.status(200).json({id: String(student[0].projectName) });
        else res.status(400).json({ msg: "false" });
      } else {
        // console.log(response)
        res.status(401).json( { msg:'User not registered'});
      }
    
};

const getAllItems = async (req, res) => {
    const projects = await Project.find();
    console.log(projects)
    res.status(200).json(projects);
};

const selectProject = async (req, res) => {
    // console.log("User")
    // console.log(User)
    const accessToken = req.params.accessToken;
    const url = 'https://graph.microsoft.com/v1.0/me';
    

    const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const email = data.mail;

        const pId = req.params.id;
        const project = await Project.findById(pId);

        const owner_id = String(project.ownerDetails);
        // console.log("1",owner_id)
        // console.log("2",project)
        // console.log("3",project.ownerDetails)
        
        const owner = await User.findById(project.ownerDetails);
        // console.log(owner)
        const ownerEmail = owner.email;

        const partner_email = req.params.partner;

        if (email === req.params.partner) {
            res.status(350).json({ "msg": "Please Select A Partner" });
        }

        if (project.intrestedPeople.length !== 0) {
            res.status(400).json({ msg: "Project Already Allotted." });
        } 
        else {
            const user = await Student.findOne({ email: email });

            const other_user = partner_email;
            const isValidUser = await Student.findOne({ email: other_user });

            if (user && String(user.projectName) !== "000000000000000000000000") {
                res.status(401).json({ msg: "Project Already Allotted To You." });
            } else if (isValidUser) {
                if (String(isValidUser.projectName) !== "000000000000000000000000") {
                    res.status(401).json({ msg: "Project Already Allotted To Partner." });
                } else {
                    if (isValidUser && project && user) {
                        const addtostudu1 = await Student.findByIdAndUpdate(user._id, { partner: isValidUser._id });
                        const addtostudu2 = await Student.findByIdAndUpdate(User._id, { $push: { intrestedLength: project._id } });
                        const addtostudu3 = await Student.findByIdAndUpdate(isValidUser._id, { partner: user._id });
                        const addtostudu4 = await Student.findByIdAndUpdate(isValidUser._id, { $push: { intrestedLength: project._id } });
                        const addtointrestedpeople = await Project.findByIdAndUpdate(project._id, { $push: { intrestedPeople: user.email } });
                        const addtointrestedpeople2 = await Project.findByIdAndUpdate(project._id, { $push: { intrestedPeople: isValidUser.email } });
                    }

                    const subject = `BTP-398`;
                    const body = `User with names : ${user.name} ${isValidUser.name} has registered for the project : ${project.title.slice(0,20)}.\n${process.env.FRONTENDURL}/login .\nKindly login to webiste and open the project and you can check user/group details.
                    `
                    sendEmail(ownerEmail,body,subject);
                    res.status(200).json({ msg: "Success" });


                }
            } else {
                res.status(403).json({ msg: "Partner Not Exists" });
            }
        }
      }
};

const getInterestedStudents = async (req, res) => {
    const id = req.params.id;
    const project = await Project.findById(id);
    const interestedStudents = project.intrestedPeople;
    let array = [];

    if (interestedStudents) {
        for (let i = 0; i < interestedStudents.length; i++) {
            const student = await Student.find({ email: interestedStudents[i] });
            array.push(student[0].email);
        }
    }
    res.status(200).json(array);
};


const allotProject = async (req, res) => {
    const id = req.params.id;
    await Project.findByIdAndUpdate(id, { intrestedPeople: [] });
    const project = await Project.findById(id);

    const owner_id = String(project.ownerDetails);
    const owner = await User.findById(owner_id);
    const ownerEmail = owner.email;
    const ownerName = owner.name;

    const student1 = await Student.find({ email: req.params.user });
    const student2 = await Student.find({ email: req.params.friend });

    if (student1[0]) {
        for (let i = 0; i < student1[0].intrestedLength.length; i++) {
            await Project.findByIdAndUpdate(student1[0].intrestedLength[i], { $pull: { intrestedPeople: student1[0].email } });
        }
    }

    if (student2[0]) {
        for (let i = 0; i < student2[0].intrestedLength.length; i++) {
            await Project.findByIdAndUpdate(student2[0].intrestedLength[i], { $pull: { intrestedPeople: student2[0].email } });
        }
    }

    const addtostudu1 = await Student.findByIdAndUpdate(student1[0]._id, { projectName: project._id });
    const addtostudu2 = await Student.findByIdAndUpdate(student2[0]._id, { projectName: project._id });
    const addtointrestedpeople = await Project.findByIdAndUpdate(project._id, { $push: { intrestedPeople: student1[0].email } });
    const addtointrestedpeople2 = await Project.findByIdAndUpdate(project._id, { $push: { intrestedPeople: student2[0].email } });
    await Project.findByIdAndUpdate(project._id, { is_banned: true });

    await Student.findByIdAndUpdate(student1[0]._id, { intrestedLength: [] });
    await Student.findByIdAndUpdate(student2[0]._id, { intrestedLength: [] });

    const subject = `BTP-398`;
    const body1 = `Dear ${student1[0].name},\n\n${ownerName} (id: ${ownerEmail}) has approved your request of registration to project ${project.title}. Therefore, you are registered to the project and can't select any other project. You can check the details on the website.\nYour partner is ${student2[0].name} (id: ${student2[0].email})`
    const body2 = `Dear ${student2[0].name},\n\n${ownerName} (id: ${ownerEmail}) has approved your request of registration to project ${project.title}. Therefore, you are registered to the project and can't select any other project. You can check the details on the website.\nYour partner is ${student1[0].name} (id: ${student1[0].email})`
    sendEmail(student1[0].email,body1,subject)
    sendEmail(student2[0].email,body2,subject)

    res.status(200).json({ msg: "allotted" });
};

const deselectProject = async (req, res) => {
    const pId = req.params.id;
    const project = await Project.findById(pId);

    if (project) {
        if (project.intrestedPeople.length === 0) {
            res.status(400).json({ msg: "No Project Allotted Yet." });
        } else {
            const user = await Student.findOne({ email: req.params.user });

            if (false) return;
            else {
                if (project && user) {
                    const partner = await Student.findById(user.partner);
                    const deltointrestedpeople = await Project.findByIdAndUpdate(project._id, { $pull: { intrestedPeople: user.email } });
                    const deltointrestedpeople2 = await Project.findByIdAndUpdate(project._id, { $pull: { intrestedPeople: partner.email } });
                    res.status(200).json({ msg: "Success" });
                }
            }
        }
    } else {
        res.status(405).json({ msg: "Failure" });
    }
};

const getPostedProjects = async (req, res) => {
    const email = req.user.id;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(200).json({ msg: "User Not Found" });
    } else {
        const projects = user.projects_posted;
        const projects_array = await extract_projects(projects);
        res.status(200).json(projects_array);
    }
};

const downLoadDetails = async (req, res, next) => {
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("My Users");

    const user = req.user.id;
    const isValidUser = await User.findOne({ email: user });
    var path = __dirname + `/public/student_data.xlsx`;

    worksheet.columns = [
        { header: "S no.", key: "s_no", width: 10 },
        { header: "Project Name", key: "pname", width: 30 },
        { header: "Student 1 Name", key: "name1", width: 20 },
        { header: "Student 1 Roll", key: "roll1", width: 15 },
        { header: "Student 1 ID", key: "id1", width: 20 },
        { header: "Student 2 Name", key: "name2", width: 20 },
        { header: "Student 2 Roll", key: "roll2", width: 15 },
        { header: "Student 2 ID", key: "id2", width: 20 },
    ];

    let counter = 1;
    if (isValidUser) var arrayOfProjects = isValidUser.projects_posted;
    var details = await intrestedPeople(arrayOfProjects);

    if (details) {
        details.forEach((entry) => {
            worksheet.addRow({
                s_no: counter,
                pname: entry[0].project_name,
                name1: entry[0][0] ? entry[0][0].name : "",
                roll1: entry[0][0] ? entry[0][0].rollNum : "",
                id1: entry[0][0] ? entry[0][0].email : "",
                name2: entry[0][0] ? entry[1][0].name : "",
                roll2: entry[0][0] ? entry[1][0].rollNum : "",
                id2: entry[0][0] ? entry[1][0].email : "",
            });
            counter++;
        });
    }

    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
    });

    const data = await workbook.xlsx.writeFile(path);
    res.status(200).download(path);
};

export {
    newproject,
    newStudent,
    getallstudent,
    updateProjectDetails,
    deleteProject,
    getOwnerDetails,
    getAllItems,
    selectProject,
    deselectProject,
    getPostedProjects,
    downLoadDetails,
    getProjectDetails,
    getInterestedStudents,
    allotProject,
    getSpecificProject,
    checkRegistered
}

// console.log("0")
// var wb = XLSX.utils.book_new();
// const user = req.params.email;
// const isValidUser = await User.findOne({ email: user });

// if(isValidUser)
// var arrayOfProjects = isValidUser.projects_posted;


// var details = await intrestedPeople(arrayOfProjects);
// var temp = JSON.stringify(details);
// temp = JSON.parse(temp);
// var ws = XLSX.utils.json_to_sheet(temp);

// console.log("2")

// var down = __dirname + `/public/student_data.xlsx`;
// XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
// XLSX.write(wb, down);
// res.status(200).download(down);
// console.log("ready to download",details)
// // console.log("ready",XLSX)
// // res.status(200).json(details);
// }