import mongoose from "mongoose";

const softwareApplicationSchema=new mongoose.Schema({
    name:String,
    svg:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },

})


export const softwareApplication=mongoose.model("softwareapplication",softwareApplicationSchema)