import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import { Project } from "../models/projectSchema.js"
import ErrorHandler from "../middlewares/error.js"

import { v2 as cloudinary } from "cloudinary"
export const addNewProject = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Project Banner Image Required !", 400))
    }

    const { projectBanner } = req.files;
    const { title, description, gitRepoLink,
        projectLink,
        technologies,
        stack,
        deployed } = req.body;

    if (!title || !description || !gitRepoLink,
        !projectLink ||
        !technologies ||
        !stack ||
        !deployed) {
        return next(new ErrorHandler("Please provide all details !", 400));


    }

    const cloudinaryResponse = await cloudinary.uploader.upload(projectBanner.tempFilePath, { folder: "PROJECT_IMAGES" })
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary Error: ", cloudinaryResponse.error || "Unknown cloudinary error")
        return next(new ErrorHandler("Failed to upload projectBanner to Cloudinary", 500))
    }


    const project = await Project.create({
        projectBanner: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        }, title, description, gitRepoLink,
        projectLink,
        technologies,
        stack,
        deployed
    })

    res.status(201).json({
        success: true,
        message: "new project added ",
        project,
    })

})

export const deleteProject = catchAsyncErrors(async (req, res, next) => {
    const {id}=req.params;
    const project=await Project.findById(id);
    if(!project){
        return next(new ErrorHandler("Project not found!",404))
    }

    await Project.deleteOne();
    res.status(200).json({
        success:true,
        message:"Project deleted!",

    })
})
export const getAllProjects = catchAsyncErrors(async (req, res, next) => {
    const projects=await Project.find();
    res.status(200).json({
        success:true,
        projects
    })
})
export const getSingleProject = catchAsyncErrors(async (req, res, next) => {
    const {id}=req.params;
    const project=await Project.findById(id)
    if(!project){
        return next(new ErrorHandler("Project not found",400));
    }
    res.status(200).json({
        success:true,
        project
    })
})
export const updateProject = catchAsyncErrors(async (req, res, next) => {
    const newProjectData = {
        title: req.body.title, description: req.body.description, gitRepoLink: req.body.gitRepoLink,
        projectLink: req.body.projectLink,
        technologies: req.body.technologies,
        stack: req.body.stack,
        deployed: req.body.deployed
    };

    if(req.files && req.files.projectBanner){
            const projectBanner=req.files.projectBanner;
            const project=await Project.findById(req.params);
            const projectBannerId=project.projectBanner.public_id;
            await cloudinary.uploader.destroy(projectBannerId);
            const cloudinaryResponse=await cloudinary.uploader.upload(
                projectBanner.tempFilePath,
                {folder:"PROJECT_IMAGES"}
            );
    
            newProjectData.projectBanner={
                public_id:cloudinaryResponse.public_id,
                url:cloudinaryResponse.secure_url,
            };
            
        }

        const project=await Project.findByIdAndUpdate(req.params.id,newProjectData,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        });

        res.status(200).json({
            success:true,
            message:"project updated",
            project
        })

})