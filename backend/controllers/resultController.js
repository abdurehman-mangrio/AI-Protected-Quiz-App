import asyncHandler from "express-async-handler";
import Result from "../models/resultModel.js";
import Question from "../models/quesModel.js";
import CodingQuestion from "../models/codingQuestionModel.js";
import mongoose from "mongoose";

// @desc    Save exam result
// @route   POST /api/results
// @access  Private
const saveResult = asyncHandler(async (req, res) => {
  try {
    const { examId, answers } = req.body;

    if (!examId || !answers) {
      res.status(400);
      throw new Error("Please provide examId and answers");
    }

    console.log("Saving result for exam:", examId, "by user:", req.user._id);

    // Get all questions for this exam to calculate marks
    const questions = await Question.find({ examId });

    // Calculate marks
    let totalMarks = 0;
    let correctAnswers = 0;

    for (const question of questions) {
      const userAnswer = answers[question._id.toString()];
      if (userAnswer) {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        if (correctOption && correctOption._id.toString() === userAnswer) {
          totalMarks += question.ansmarks || 1;
          correctAnswers++;
        }
      }
    }

    // Calculate percentage
    const totalQuestions = questions.length;
    const percentage =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const result = await Result.create({
      examId,
      userId: req.user._id,
      answers: new Map(Object.entries(answers)),
      totalMarks,
      percentage,
      showToStudent: true, // Automatically show to student after submission
    });

    console.log("Result saved successfully:", result._id);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in saveResult:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get results for a specific exam (for teachers)
// @route   GET /api/results/exam/:examId
// @access  Private
const getResultsByExamId = asyncHandler(async (req, res) => {
  try {
    const { examId } = req.params;

    console.log("Fetching results for exam:", examId);

    // Get MCQ results
    const results = await Result.find({ examId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    console.log(`Found ${results.length} MCQ results`);

    // Get coding questions and submissions
    const codingQuestions = await CodingQuestion.find({ examId }).populate(
      "submittedAnswer"
    );

    // Combine MCQ and coding results
    const combinedResults = results.map((result) => {
      const studentCodingSubmissions = codingQuestions
        .filter(
          (q) =>
            q.submittedAnswer &&
            q.submittedAnswer.userId?.toString() === result.userId._id.toString()
        )
        .map((q) => ({
          question: q.question,
          code: q.submittedAnswer.code,
          language: q.submittedAnswer.language,
          status: q.submittedAnswer.status,
          executionTime: q.submittedAnswer.executionTime,
        }));

      return {
        ...result.toObject(),
        codingSubmissions: studentCodingSubmissions,
      };
    });

    res.status(200).json({
      success: true,
      data: combinedResults,
    });
  } catch (error) {
    console.error("Error in getResultsByExamId:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get results for current user
// @route   GET /api/results/user
// @access  Private
const getUserResults = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching results for user:", req.user._id);

    const results = await Result.find({
      userId: req.user._id,
      // No showToStudent filter - show all results to students automatically
    }).sort({
      createdAt: -1,
    });

    console.log(`Found ${results.length} results for user`);

    // Get coding submissions for each exam
    const resultsWithCoding = await Promise.all(
      results.map(async (result) => {
        const codingQuestions = await CodingQuestion.find({
          examId: result.examId,
          "submittedAnswer.userId": req.user._id,
        }).select("question submittedAnswer");

        return {
          ...result.toObject(),
          codingSubmissions: codingQuestions.map((q) => ({
            question: q.question,
            code: q.submittedAnswer.code,
            language: q.submittedAnswer.language,
            status: q.submittedAnswer.status,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: resultsWithCoding,
    });
  } catch (error) {
    console.error("Error in getUserResults:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Toggle showToStudent for a result (optional - if you still want this feature)
// @route   PUT /api/results/:resultId/toggle-visibility
// @access  Private (Teacher only)
const toggleResultVisibility = asyncHandler(async (req, res) => {
  try {
    const { resultId } = req.params;

    console.log("Toggling visibility for result:", resultId);

    // Check if user is a teacher
    if (req.user.role !== "teacher") {
      res.status(403);
      throw new Error("Not authorized to toggle result visibility");
    }

    const result = await Result.findById(resultId);
    
    if (!result) {
      res.status(404);
      throw new Error("Result not found");
    }

    console.log("Current visibility:", result.showToStudent);

    // Toggle the visibility
    result.showToStudent = !result.showToStudent;
    await result.save();

    console.log("New visibility:", result.showToStudent);

    res.status(200).json({
      success: true,
      data: {
        _id: result._id,
        showToStudent: result.showToStudent,
        message: `Result visibility ${result.showToStudent ? 'enabled' : 'disabled'} successfully`
      },
    });
  } catch (error) {
    console.error("Error in toggleResultVisibility:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get all results (for teachers)
// @route   GET /api/results/all
// @access  Private (Teacher only)
const getAllResults = asyncHandler(async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== "teacher") {
      res.status(403);
      throw new Error("Not authorized to view all results");
    }

    console.log("Fetching all results for teacher:", req.user._id);

    // Get all exams to map examId to exam names
    const Exam = mongoose.model("Exam");
    const exams = await Exam.find().select('_id examName');
    const examMap = {};
    exams.forEach(exam => {
      examMap[exam._id.toString()] = exam.examName;
    });

    // Get results - don't populate examId since it's a String
    const results = await Result.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    console.log(`Found ${results.length} results`);

    // Get coding questions and submissions
    const codingQuestions = await CodingQuestion.find().populate({
      path: "submittedAnswer",
      populate: {
        path: "userId",
        select: "name email"
      }
    });

    console.log(`Found ${codingQuestions.length} coding questions`);

    // Combine MCQ and coding results
    const combinedResults = results.map((result) => {
      const studentCodingSubmissions = codingQuestions
        .filter(
          (q) =>
            q.submittedAnswer &&
            q.submittedAnswer.userId &&
            q.submittedAnswer.userId._id.toString() === result.userId._id.toString()
        )
        .map((q) => ({
          question: q.question,
          code: q.submittedAnswer?.code || "No code submitted",
          language: q.submittedAnswer?.language || "Unknown",
          status: q.submittedAnswer?.status || "Not submitted",
          executionTime: q.submittedAnswer?.executionTime || 0,
        }));

      return {
        _id: result._id,
        examId: result.examId,
        examName: examMap[result.examId] || "Unknown Exam", // Add exam name from map
        userId: result.userId,
        answers: result.answers,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        showToStudent: result.showToStudent,
        codingMarks: result.codingMarks,
        totalScore: result.totalScore,
        feedback: result.feedback,
        gradedBy: result.gradedBy,
        gradedAt: result.gradedAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        codingSubmissions: studentCodingSubmissions,
      };
    });

    res.status(200).json({
      success: true,
      data: combinedResults,
    });
  } catch (error) {
    console.error("Error in getAllResults:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// @desc    Get single result by ID
// @route   GET /api/results/:id
// @access  Private
const getResultById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Fetching result by ID:", id);

    const result = await Result.findById(id)
      .populate("userId", "name email");

    if (!result) {
      res.status(404);
      throw new Error("Result not found");
    }

    // Check if user is authorized to view this result
    if (req.user.role !== "teacher" && result.userId._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view this result");
    }

    // Get coding submissions for this result
    const codingQuestions = await CodingQuestion.find({
      examId: result.examId,
      "submittedAnswer.userId": result.userId._id,
    }).select("question submittedAnswer");

    const resultWithCoding = {
      ...result.toObject(),
      codingSubmissions: codingQuestions.map((q) => ({
        question: q.question,
        code: q.submittedAnswer.code,
        language: q.submittedAnswer.language,
        status: q.submittedAnswer.status,
        executionTime: q.submittedAnswer.executionTime,
      })),
    };

    res.status(200).json({
      success: true,
      data: resultWithCoding,
    });
  } catch (error) {
    console.error("Error in getResultById:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Update result
// @route   PUT /api/results/:id
// @access  Private (Teacher only)
const updateResult = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is a teacher
    if (req.user.role !== "teacher") {
      res.status(403);
      throw new Error("Not authorized to update results");
    }

    const result = await Result.findById(id);

    if (!result) {
      res.status(404);
      throw new Error("Result not found");
    }

    const { totalMarks, percentage, codingMarks, totalScore, feedback, showToStudent } = req.body;

    // Update fields if provided
    if (totalMarks !== undefined) result.totalMarks = totalMarks;
    if (percentage !== undefined) result.percentage = percentage;
    if (codingMarks !== undefined) result.codingMarks = codingMarks;
    if (totalScore !== undefined) result.totalScore = totalScore;
    if (feedback !== undefined) result.feedback = feedback;
    if (showToStudent !== undefined) result.showToStudent = showToStudent;

    result.gradedBy = req.user._id;
    result.gradedAt = new Date();

    await result.save();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in updateResult:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Private (Teacher only)
const deleteResult = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is a teacher
    if (req.user.role !== "teacher") {
      res.status(403);
      throw new Error("Not authorized to delete results");
    }

    const result = await Result.findById(id);

    if (!result) {
      res.status(404);
      throw new Error("Result not found");
    }

    await Result.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteResult:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export {
  saveResult,
  getResultsByExamId,
  getUserResults,
  toggleResultVisibility,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
};