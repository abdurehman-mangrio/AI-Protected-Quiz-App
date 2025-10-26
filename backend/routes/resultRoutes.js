import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  saveResult,
  getResultsByExamId,
  getUserResults,
  toggleResultVisibility,
  getAllResults,
} from "../controllers/resultController.js";

const resultRoutes = express.Router();

// Apply protect middleware to all routes
resultRoutes.use(protect);

// Define routes in the correct order (more specific first)
resultRoutes.get("/results/all", getAllResults); // This should come first
resultRoutes.get("/results/exam/:examId", getResultsByExamId);
resultRoutes.get("/results/user", getUserResults);
resultRoutes.post("/results", saveResult);
resultRoutes.put("/results/:resultId/toggle-visibility", toggleResultVisibility);

export default resultRoutes;