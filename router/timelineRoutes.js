import express from "express";
import { postTimeline,deleteTimeline,getAllTimeline } from "../controller/timelineController.js";
import { isAuthenticatd } from "../middlewares/auth.js";
const router = express.Router();

router.post("/add",isAuthenticatd,postTimeline);
router.delete("/delete/:id",isAuthenticatd,deleteTimeline);
router.get("/getall",getAllTimeline);

export default router;