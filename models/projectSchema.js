import mongoose from "mongoose"

const projectSchema=mongoose.Schema({
    title:{
        type:String,
    },
    description:{
        type:String
    },
    gitRepoLink:String,
    projectLink:{
        type:String
    },
    technologies:{
        type:String
    },
    stack:{
        type:String
    },
    deployed:{
        type:String
    },
    deployed:{
        type:String,
    },
    projectBanner:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }
})


export const Project=mongoose.model("project",projectSchema)