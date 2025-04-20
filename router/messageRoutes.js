import express from "express"
import { sendMessages ,getAllmessages,deleteMessage} from "../controllers/messageController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router=express.Router();

router.post("/send",sendMessages)
router.get("/getAll",getAllmessages)
router.delete("/delete/:id",isAuthenticated,deleteMessage)

export default router;  
