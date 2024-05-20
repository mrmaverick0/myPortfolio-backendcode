import express from "express";
import { addNewProject ,deleteProject,updateProject,getAllProjects,getSingleProject} from "../controller/projectController.js";
import { isAuthenticatd } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add",isAuthenticatd,addNewProject);
router.delete("/delete/:id",isAuthenticatd,deleteProject);
router.put("/update/:id",isAuthenticatd,updateProject);
router.get("/getall",getAllProjects);
router.get("/get/:id",getSingleProject);

export default router;