import express from "express";
import { addNewApplication,deleteApplication,getAllApplication } from "../controller/softwareApplicationController.js";
import { isAuthenticatd } from "../middlewares/auth.js";
const router = express.Router();

router.post("/add",isAuthenticatd,addNewApplication);
router.delete("/delete/:id",isAuthenticatd,deleteApplication);
router.get("/getall",getAllApplication);

export default router;