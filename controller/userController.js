import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";



export const register = catchAsyncError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Avatar and Resume are  Required", 400));
  }
  const { avatar } = req.files;
  const cloudinaryResponseAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    { folder: "Avatar" }
  );

  if (!cloudinaryResponseAvatar || cloudinaryResponseAvatar.error) {
    console.log(
      "Cloudinary Error",
      cloudinaryResponseAvatar.error || "Unknow Cloudinary error"
    );
  }
  const { resume } = req.files;
  const cloudinaryResponseResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    { folder: "Resume" }
  );

  if (!cloudinaryResponseResume || cloudinaryResponseResume.error) {
    console.log(
      "Cloudinary Error",
      cloudinaryResponseResume.error || "Unknow Cloudinary error"
    );
  }

  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedInURL,
  } = req.body;

  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedInURL,
    avatar: {
      public_id: cloudinaryResponseAvatar.public_id,
      url: cloudinaryResponseAvatar.secure_url,
    },
    resume: {
      public_id: cloudinaryResponseResume.public_id,
      url: cloudinaryResponseResume.secure_url,
    },
  });
  generateToken(user, "User Registerd", 201, res);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Email and Password are required!"));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password"));
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email or Password"));
  }
  generateToken(user, "LoggedIn", 200, res);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite:"None",
      secure:true
    })
    .json({
      success: true,
      message: "Logged Out",
    });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    portfolioURL: req.body.portfolioURL,
    githubURL: req.body.githubURL,
    instagramURL: req.body.instagramURL,
    twitterURL: req.body.twitterURL,
    facebookURL: req.body.facebookURL,
    linkedInURL: req.body.linkedInURL,
  };
  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);
    const profileImage = user.avatar.public_id;
    //! delete existing image
    await cloudinary.uploader.destroy(profileImage);
    //! upload new image
    const cloudinaryResponse = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      {
        folder: "Avatar",
      }
    );
    newUserData.avatar = {
      public_id:cloudinaryResponse.public_id,
      url:cloudinaryResponse.secure_url,
    }
  }

  if (req.files && req.files.resume) {
    const avatar = req.files.resume;
    const user = await User.findById(req.user.id);
    const resumeId = user.resume.public_id;
    //! delete existing image
    await cloudinary.uploader.destroy(resumeId);
    //! upload new image
    const cloudinaryResponse = await cloudinary.uploader.upload(
      resume.tempFilePath,
      {
        folder: "Resume",
      }
    );
    newUserData.resume = {
      public_id:cloudinaryResponse.public_id,
      url:cloudinaryResponse.secure_url,
    }
  }
  const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  });
  res.status(200).json({
    succes:true,
    message:"Profile Updated!",
    user,
  })
});

export const updatePassword = catchAsyncError(async(req,res,next)=>{
  const {currentPassword,newPassword,confirmPassword} = req.body;

  if(!currentPassword||!newPassword||!confirmPassword){
    return next(new ErrorHandler("Please fill all fields",400));
  }

  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if(!isPasswordMatched){
    return next(new ErrorHandler(" Incorrect current password",400));

  }
  if(newPassword !== confirmPassword){
    return next(new ErrorHandler(" confirm Password and new password do not match",400));
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success:true,
    message:"Password updated!",
  })
});

export const getUserForPortfolio = catchAsyncError(async(req,res,next)=>{
  const id="664a11782ec62e394dd77d20";
  const user = await User.findById(id);
  res.status(200).json({
    success:true,
    user,
  });
});

export const fotgotPassword = catchAsyncError(async(req,res,next)=>{
  const user = await User.findOne({email:req.body.email});
  if(!user){
    return next(new ErrorHandler("User not found",404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({validateBeforeSave:false});
  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
  const message = `Your reset password token is:- \n\n${resetPasswordUrl}\n\n If you've not request for this please ignore it. Thak You :)`;

  try {
    await sendEmail({email:user.email,subject:"Personal Portfolio Dashboard Recovery Password",message});
    res.status(200).json({
      succes:true,
      message:`Email sent to ${user.email} successfully!`
    })
  } catch (error) {
    user.resetPasswrodExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    return next(new ErrorHandler(error.message,500));
  }
});

export const resetPassword = catchAsyncError(async(req,res,next)=>{
  const {token}  = req.params;
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswrodExpire:{$gt:Date.now()},

  });
  if(!user){
    return next(new ErrorHandler('Reset Password token is invalid or expired',400));

  }
  if(req.body.password !== req.body.confirmPassword){
    return next(new ErrorHandler("password & confirm password do not match"));
  }
  user.password =req.body.password;
  user.resetPasswrodExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();
  generateToken(user,'Reset password successfully',200,res);
})