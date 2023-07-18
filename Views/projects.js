import express from "express";
import { deleteProject, deselectProject,  getAllItems, getOwnerDeltails, getPostedProjects, newproject, selectProject, updateProjectDetails, downLoadDetails, getprojectDetails, newStudent, getallstudent } from "../Controllers/projectController.js";
const router = express.Router();

import {fetchuser,fetchUserByEmail} from "../Middlewares/fetchuser.js";
import { sendFeedback } from "../Controllers/userController.js";

router.post("/newproject",fetchuser,newproject);
router.post("/newstudent",newStudent);
router.patch("/updateproject/:id",fetchuser,updateProjectDetails);
router.delete("/deleteproject/:id",fetchuser,deleteProject);
router.get("/ownerdetails/:id",getOwnerDeltails);
router.get("/allprojects",getAllItems);
router.get("/projectdetails/:id",getprojectDetails);
router.get("/projectaddition/:id/:user/:email",selectProject);
router.get("/deselectproject/:id/:user",deselectProject);
router.get("/projectsposted",fetchuser,getPostedProjects);
router.get("/intrestedpeople/:token",fetchUserByEmail,downLoadDetails);
router.get("/getallstudent",getallstudent);
router.post("/feedback",sendFeedback);

const project = router

export default project;