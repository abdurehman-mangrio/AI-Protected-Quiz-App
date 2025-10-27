import express from "express";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import examRoutes from "./routes/examRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import codingRoutes from "./routes/codingRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import { exec } from "child_process";
import fs from "fs";
import { writeFileSync } from "fs";
import path from "path";
import cors from "cors";
import smsRoutes from './routes/smsRoutes.js';

dotenv.config();
connectDB();
const app = express();
const port = process.env.PORT || 5000;

// to parse req body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration for production
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL, // Your Vercel frontend URL
      "https://ai-protected-quiz-app.vercel.app", // Your actual Vercel domain
      "http://localhost:3000",
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

// Code execution endpoints - only in development for security
if (process.env.NODE_ENV !== 'production') {
  app.post("/run-python", (req, res) => {
    const { code } = req.body;
    writeFileSync("script.py", code);

    exec("python script.py", (error, stdout, stderr) => {
      if (error) {
        res.send(`Error is: ${stderr}`);
      } else {
        res.send(stdout);
      }
    });
  });

  app.post("/run-javascript", (req, res) => {
    const { code } = req.body;
    writeFileSync("script.js", code);

    exec("node script.js", (error, stdout, stderr) => {
      if (error) {
        res.send(`Error: ${stderr}`);
      } else {
        res.send(stdout);
      }
    });
  });

  app.post("/run-java", (req, res) => {
    const { code } = req.body;
    writeFileSync("Main.java", code);

    exec("javac Main.java && java Main", (error, stdout, stderr) => {
      if (error) {
        res.send(`Error: ${stderr}`);
      } else {
        res.send(stdout);
      }
    });
  });
} else {
  // In production, provide informative message
  app.post("/run-python", (req, res) => {
    res.status(403).json({ 
      message: "Code execution disabled in production for security",
      note: "This feature is only available in development mode"
    });
  });

  app.post("/run-javascript", (req, res) => {
    res.status(403).json({ 
      message: "Code execution disabled in production for security",
      note: "This feature is only available in development mode"
    });
  });

  app.post("/run-java", (req, res) => {
    res.status(403).json({ 
      message: "Code execution disabled in production for security",
      note: "This feature is only available in development mode"
    });
  });
}

// Routes
app.use("/api/users", userRoutes);
app.use("/api/users", examRoutes);
app.use("/api/users", resultRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/sms", smsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    message: 'AI Proctored Backend is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({ 
    message: 'Welcome to AI Proctored System Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/users/auth',
      exams: '/api/users/exam',
      cheatingLogs: '/api/users/cheatingLogs',
      coding: '/api/coding',
      health: '/api/health'
    }
  });
});

// Production setup - serve frontend
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  
  // Serve static files from frontend build
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  // Handle SPA routing - all unknown routes go to index.html
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
} else {
  // Development root endpoint
  app.get("/", (req, res) => {
    res.json({ 
      message: "AI Proctored System Backend Server is running",
      environment: "development",
      endpoints: {
        health: "/api/health",
        api_docs: "/api"
      }
    });
  });
}

// Error handling middleware - must be after all routes
app.use(notFound);
app.use(errorHandler);

// Server
app.listen(port, () => {
  console.log(`🚀 Server is running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📍 Port: ${port}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: ${process.env.NODE_ENV === 'production' ? 'MongoDB Atlas' : 'Local MongoDB'}`);
});

export default app;