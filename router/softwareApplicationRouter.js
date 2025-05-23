import express from "express"
import {addNewApplication,deleteApplication,getAllApplications} from "../controllers/softwareApplicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router=express.Router();

router.post("/add",isAuthenticated,addNewApplication)
router.delete("/delete/:id",isAuthenticated,deleteApplication)
router.get("/getAll",getAllApplications)

export default router;  
