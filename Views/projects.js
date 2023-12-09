import express from "express";
import { deleteProject, deselectProject,  getAllItems, getOwnerDetails, getPostedProjects, newproject, selectProject, updateProjectDetails, downLoadDetails, getProjectDetails, newStudent, getallstudent, getInterestedStudents, allotProject, getSpecificProject, checkRegistered } from "../Controllers/projectController.js";
const router = express.Router();

import {fetchuser,fetchUserByEmail} from "../Middlewares/fetchuser.js";
import { sendFeedback } from "../Controllers/userController.js";

router.post("/newproject",fetchuser,newproject);
router.post("/newstudent",newStudent);
router.patch("/updateproject/:id",fetchuser,updateProjectDetails);
router.delete("/deleteproject/:id",fetchuser,deleteProject);
router.get("/ownerdetails/:id",getOwnerDetails);
router.get("/getInterestedStudents/:id",getInterestedStudents);
router.get("/allotProject/:id/:user/:friend",allotProject);
router.get("/allprojects",getAllItems);
router.get("/projectSpecific/:id",getSpecificProject);
router.get("/checkRegistered/:email",checkRegistered);
router.get("/projectdetails/:id",getProjectDetails);
router.get("/projectaddition/:id/:user/:email",selectProject);
router.get("/deselectproject/:id/:user",deselectProject);
router.get("/projectsposted",fetchuser,getPostedProjects);
router.get("/intrestedpeople/:token",fetchUserByEmail,downLoadDetails);
router.get("/getallstudent",getallstudent);
router.post("/feedback",sendFeedback);

const project = router

export default project;