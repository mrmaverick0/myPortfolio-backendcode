import express from "express";
import { fotgotPassword, getUser, getUserForPortfolio, login, logout, register, resetPassword, updatePassword, updateProfile } from "../controller/userController.js";
import { isAuthenticatd } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/logout",isAuthenticatd,logout);
router.get("/me",isAuthenticatd,getUser);
router.put("/update/me",isAuthenticatd,updateProfile);
router.put("/update/password",isAuthenticatd,updatePassword);
router.get("/portfolio/me",getUserForPortfolio);
router.post("/password/forgot",fotgotPassword);
router.put("/password/reset/:token",resetPassword);

export default router;