import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { deleteProject, deselectProject,  getAllItems, getOwnerDeltails, getPostedProjects, newproject, selectProject, updateProjectDetails, downLoadDetails, getprojectDetails, newStudent, getallstudent } from "../Controllers/projectController.js";
const router = express.Router();

import fetchuser from "../Middlewares/fetchuser.js";

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
router.get("/intrestedpeople/:email",downLoadDetails);
router.get("/getallstudent",getallstudent);

const project = router

export default project;