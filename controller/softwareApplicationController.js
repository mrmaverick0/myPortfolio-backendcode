import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js"
import {SoftwareApplication} from "../models/softwareApplicationSchema.js";

import { v2 as cloudinary } from "cloudinary";


export const addNewApplication = catchAsyncError(async(req,res,next)=>{
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Software Application Icon/svg Required", 400));
      }
      const { svg } = req.files;
      const { name } = req.body;
      console.log(name);
      if(!name){
        return next(new ErrorHandler("Software's name is Required", 400));
      }
      const cloudinaryResponse = await cloudinary.uploader.upload(
        svg.tempFilePath,
        { folder: "Portfolio_Software_application" }
      );
    
      if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
          "Cloudinary Error",
          cloudinaryResponse.error || "Unknow Cloudinary error"
        );
      }

      const softwareApplication = await SoftwareApplication.create({
        name,
        svg:{
            public_id:cloudinaryResponse.public_id,
            url:cloudinaryResponse.secure_url,
        }
      });
      res.status(200).json({
        success:true,message:"New Software Application Added",
        softwareApplication
      })
})
export const deleteApplication = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    const softwareApplication = await SoftwareApplication.findById(id);
    if(!softwareApplication){
        return next(new ErrorHandler("Software Application not found",404));
    }
    const softwareApplicationSvgId = softwareApplication.svg.public_id;
    await cloudinary.uploader.destroy(softwareApplicationSvgId);
    await softwareApplication.deleteOne();
    res.status(200).json({
        succes:true,
        message:"Software Application Deleted!"
    });
})
export const getAllApplication = catchAsyncError(async(req,res,next)=>{
    const softwareApplication = await SoftwareApplication.find();
    res.status(200).json({
        success:true,
        softwareApplication
    })
})