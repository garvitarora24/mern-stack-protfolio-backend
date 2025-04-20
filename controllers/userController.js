import {User} from '../models/userSchema.js'
import ErrorHandler from '../middlewares/error.js'
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js'
import {v2 as cloudinary} from "cloudinary"
import { generateToken } from '../utils/jwtToken.js'
import { sendEmail } from '../utils/sendEmail.js'
import crypto from "crypto"


export const register=catchAsyncErrors(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length===0){
        return next(new ErrorHandler("Avatar and Resume Are Required !",400))
    }

    const {avatar,resume}=req.files;

    // console.log(avatar,resume)
    const cloudinaryResponseAvatar=await cloudinary.uploader.upload(avatar.tempFilePath
        ,{folder:"AVATARS"}
    )
    if(!cloudinaryResponseAvatar ||  cloudinaryResponseAvatar.error){
        console.error("Cloudinary Error: ", cloudinaryResponseAvatar.error || "Unknown cloudinary error")

    }

    const cloudinaryResponseResume=await cloudinary.uploader.upload(resume.tempFilePath
        ,{folder:"MY_RESUME"}
    )
    if(!cloudinaryResponseResume ||  cloudinaryResponseResume.error){
        console.error("Cloudinary Error: ", cloudinaryResponseResume.error || "Unknown cloudinary error")

    }

    const {  
    fullName,
    email,phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    faceBookURL,
    twitterURL,
    linkedinURL
    }=req.body;
    
    // console.log("POTFOLIOO URL ",portfolioURL)

    const user=await User.create({
        fullName,
        email,phone,
        aboutMe,
        password,
        portfolioURL,
        githubURL,
        instagramURL,
        faceBookURL,
        twitterURL,
        linkedinURL,
        avatar:{
            public_id:cloudinaryResponseAvatar.public_id,
            url:cloudinaryResponseAvatar.secure_url,
        },
        resume:{
            public_id:cloudinaryResponseResume.public_id,
            url:cloudinaryResponseResume.secure_url,
        }
    });

    // res.status(200).json({
    //     success:true,
    //     message:"User Registered"
    // })

    generateToken(user,"user registered",201,res)


})

export const login=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return next(new ErrorHandler("Email and password are Required !"))
    }
    const user=await User.findOne({ email }).select("+password");
    if(!user){ 
        return next(new ErrorHandler("Invalid Email or Password "))
    }
    const isPasswordMatched=await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password "))
    }
    generateToken(user,"logged in ",200,res)


})


export const logout=catchAsyncErrors(async(req,res,next)=>{
    res.status(200).cookie("token","",{
        expires:new Date(Date.now()),
        httpOnly:true,
        
    }).json({
        success:true,
        message:"Logged out",
        sameSite:"None",
        secure:true,
    })
})


export const getUser=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.user.id)
    res.status(200).json({
        success:true,
        user,
    })    
});


export const updateProfile=catchAsyncErrors(async(req,res,next)=>{
    const newUserData={
        fullName:req.body.fullName,
        email:req.body.email,phone:req.body.phone,
        aboutMe:req.body.aboutMe,
        password:req.body.password,
        portfolioURL:req.body.portfolioURL,
        githubURL:req.body.githubURL,
        instagramURL:req.body.instagramURL,
        faceBookURL:req.body.faceBookURL,
        twitterURL:req.body.twitterURL,
        linkedinURL:req.body.linkedinURL
    }

    if(req.files && req.files.avatar){
        const avatar=req.files.avatar;
        const user=await User.findById(req.user.id);
        const profileImageId=user.avatar.public_id;
        await cloudinary.uploader.destroy(profileImageId);
        const cloudinaryResponse=await cloudinary.uploader.upload(
            avatar.tempFilePath,
            {folder:"AVATARS"}
        );

        newUserData.avatar={
            public_id:cloudinaryResponse.public_id,
            url:cloudinaryResponse.secure_url,
        };

    }


    if(req.files && req.files.resume){
        const resume=req.files.resume;
        const user=await User.findById(req.user.id);
        const resumeId=user.resume.public_id;
        await cloudinary.uploader.destroy(resumeId);
        const cloudinaryResponse=await cloudinary.uploader.upload(
            resume.tempFilePath,
            {folder:"MY_RESUME"}
        );

        newUserData.resume={
            public_id:cloudinaryResponse.public_id,
            url:cloudinaryResponse.secure_url,
        };
        
    }


    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
        message:"Profile Updated!",
        user,
    })
});


export const updatePassword=catchAsyncErrors(async(req,res,next)=>{
    const {currentPassword,newPassword,confirmNewPassword}=req.body;
    if(!currentPassword|| !newPassword || !confirmNewPassword){
        return next(new ErrorHandler("PLease fill all the fields ",400));
    }   
 
    const user=await User.findById(req.user.id).select("+password");
    const isPasswordMatched=await user.comparePassword(currentPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Incorrect current password ",400));
    }  
    
    if(newPassword!==confirmNewPassword){
        return next(new ErrorHandler("new password and confirm password do not match ",400));
    }

    user.password=newPassword;
    await user.save();
    res.status(200).json({
        success:true,
        message:"password updated!"
    });
    

})


export const getUserForPortfolio=catchAsyncErrors(async(req,res,next)=>{
    const id="67c89da25437dad26a870a35"
    const user=await User.findById(id);
    res.status(200).json({
        success:true,
        user ,
    })

})


export const forgotPassword=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findOne({
        email:req.body.email
    })
    if(!user){
        return next(new ErrorHandler("user not found!",404))
    }
    const resetToken= user.getResetPasswordToken();

    await user.save({validateBeforeSave:false})

    const resetPasswordUrl=`${process.env.DASHBOARD_URL}/password/reset/${resetToken}`
    const message=`your reset password token is \n\n ${resetPasswordUrl}\n\n if you have not requested for this please ignore it . `

    try {
        await sendEmail({
            email:user.email,
            subject:"personal portfolio dashboard recovery password",
            message,
        })

        res.status(200).json({
            success:true,
            message:`email sent to ${user.email} succesfully`
        })
    } catch (error) {
        user.resetPasswordExpire=undefined;
        user.resetPasswordToken=undefined;
        await user.save()
        return next(new ErrorHandler(error.message,500))
    }

})


export const resetPassword=catchAsyncErrors(async(req,res,next)=>{
    const {token}=req.params;
    const resetPasswordToken=crypto.createHash("sha256").update(token).digest("hex");

    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    })
    if(!user){
        return next(new ErrorHandler("Reset Password token is inavlid or has been expired",400))
    }
    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("password and confirm password do not match"))
    }

    user.password=await req.body.password;

    user.resetPasswordExpire=undefined
    user.resetPasswordToken=undefined

    await user.save();

    generateToken(user,"Reset password succesfully!",200,res);

})