import express from "express";
import { addNewSkill ,deleteSkill,updateSkill,getAllSkills} from "../controller/skillController.js";
import { isAuthenticatd } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add",isAuthenticatd,addNewSkill);
router.delete("/delete/:id",isAuthenticatd,deleteSkill);
router.put("/update/:id",isAuthenticatd,updateSkill);
router.get("/getall",getAllSkills);

export default router;