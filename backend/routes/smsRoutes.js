import express from "express";
import { sendSMS, checkSMSBalance } from "../controllers/smsController.js";
import { protect } from "../middleware/authMiddleware.js";

const smsRoutes = express.Router();

smsRoutes.post("/send", protect, sendSMS);
smsRoutes.get("/balance", protect, checkSMSBalance);

export default smsRoutes;