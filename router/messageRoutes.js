import express from "express";
import { getAllMessage, sendMessage,deleteMessage } from "../controller/messageController.js";
import { isAuthenticatd } from "../middlewares/auth.js";
const router = express.Router();

router.post("/send",sendMessage);
router.get("/getAllMessage",getAllMessage);
router.delete("/delete/:id",isAuthenticatd,deleteMessage);

export default router;