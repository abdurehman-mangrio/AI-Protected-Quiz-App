import express from "express";
import {
  authUser,
  getUserProfile,
  logoutUser,
  updateUserProfile,
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  uploadUsersCSV,
  uploadCSVMiddleware,
  getUsersWithPasswords,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const userRoutes = express.Router();

// Public routes
userRoutes.post("/auth", authUser);
userRoutes.post("/logout", logoutUser);

// Protected routes (all users)
userRoutes
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin-only routes for user management
userRoutes.route("/")
  .post(protect, createUser)
  .get(protect, getUsers);

userRoutes.route("/:id")
  .delete(protect, deleteUser)
  .put(protect, updateUser);

// CSV Upload routes (WITH multer middleware)
userRoutes.post("/upload-csv", protect, uploadCSVMiddleware, uploadUsersCSV);
userRoutes.get("/with-passwords", protect, getUsersWithPasswords);

export default userRoutes;