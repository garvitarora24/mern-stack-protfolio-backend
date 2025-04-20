import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"

import {TimeLine} from '../models/timelineSchema.js'
import ErrorHandler from '../middlewares/error.js'

export const postTimeline=catchAsyncErrors(async(req,res,next)=>{
    const {title,description,from,to }=req.body;

    const newtimeline=await TimeLine.create({
        title,description,timeline:{from,to},
    })

    res.status(200).json({
        success: true,
        message: "Timeline Added!",
        newtimeline,
    })

})

export const deleteTimeline=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    const timelineToDel=await TimeLine.findById(id);
    if(!timelineToDel){
        return next(new ErrorHandler("Timeline not found !",400))
    }

    await timelineToDel.deleteOne();
    res.status(200).json({
        success:true,
        message:"timeline deleted succesfully"
        
    })

})
export const getAllTimelines=catchAsyncErrors(async(req,res,next)=>{
    const timelines=await TimeLine.find()
    res.status(200).json({
        success:true,
        timelines
    })
   
})