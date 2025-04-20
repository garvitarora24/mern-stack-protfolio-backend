import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import {softwareApplication} from '../models/softwareApplication.js'
import ErrorHandler from '../middlewares/error.js'
import {v2 as cloudinary} from "cloudinary"

export const addNewApplication = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("software Application icon/svg Required !", 400))
    }

    const { svg } = req.files;
    const { name } = req.body;
    if (!name) {
        return next(new ErrorHandler("Software name is required "))
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(svg.tempFilePath
        , { folder: "PORTFOLIO_SOFTWARE_APPLICATIONS" }
    )
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary Error: ", cloudinaryResponse.error || "Unknown cloudinary error")
    }

    const softwareapplication = await softwareApplication.create({
        name,
        svg: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
           
        }
    })

    res.status(200).json({
        success:true,
        message:"new software Application added !",
        softwareapplication
    })


})

export const deleteApplication = catchAsyncErrors(async (req, res, next) => {

    const {id}=req.params;
    const softwareApplcationDel=await softwareApplication.findById(id)
    if(!softwareApplcationDel){
        return next(new ErrorHandler("software  Application not found ",404));
    }

    const softwareApplcationSvgId=softwareApplcationDel.svg.public_id
    await cloudinary.uploader.destroy(softwareApplcationSvgId)
    await softwareApplication.deleteOne();
    res.status(200).json({
        success:true,
        message:"software apllication deleted ! "
    })


})

export const getAllApplications = catchAsyncErrors(async (req, res, next) => {
    const applications=await softwareApplication.find()
        res.status(200).json({
            success:true,
            applications
        })
})