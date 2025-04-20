
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Skill } from "../models/skillsSchema.js"
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from "cloudinary"

export const addNewSkill = catchAsyncErrors(async (req, res, next) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Skill svg is Required !", 400))
    }

    const { svg } = req.files;
    const { title, proficiency } = req.body;
    if (!title || !proficiency) {
        return next(new ErrorHandler("Skill title and profienciency is required ", 400))
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(svg.tempFilePath
        , { folder: "PORTFOLIO_SKILLS" }
    )
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary Error: ", cloudinaryResponse.error || "Unknown cloudinary error")
    }


    const newskill = await Skill.create({
        title,
        proficiency,
        svg: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,

        }
    })

    res.status(200).json({
        success: true,
        message: "skill added succesfully",
        newskill

    })
})

export const getAllSkills = catchAsyncErrors(async (req, res, next) => {

    const skill = await Skill.find();
    res.status(200).json({
        success: true,
        skill

    })
})

export const updateSkill = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    let skillToUpdate = await Skill.findById(id);
    if(!skillToUpdate){
        return next(new ErrorHandler("skill delted already",404))
    }
    const {proficiency}=req.body;
    skillToUpdate=await Skill.findByIdAndUpdate(id,{proficiency},{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })
    res.status(200).json({
        success:true,
        message:"skill updated",
        skillToUpdate
        
    })
})


export const deleteSkill = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const skillToDel = await Skill.findById(id)
    if (!skillToDel) {
        return next(new ErrorHandler("no such skill exists",400))
    }


    const skillToDelSvgId = skillToDel.svg.public_id
    await cloudinary.uploader.destroy(skillToDelSvgId)
    await skillToDel.deleteOne();
    res.status(200).json({
        success: true,
        message: "software apllication deleted ! "
    })

})