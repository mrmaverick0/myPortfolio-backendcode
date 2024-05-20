import {User} from "../models/userSchema.js"
import {catchAsyncError} from "./catchAsyncErrors.js"
import ErrorHandler from "./error.js"
import jwt from "jsonwebtoken"

export const isAuthenticatd = catchAsyncError(async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("user not Authenticated",400));

    }
    const decoded = jwt.verify(token,process.env.JWT_SECRECT_KEY);
    req.user = await User.findById(decoded.id);
    next();
})