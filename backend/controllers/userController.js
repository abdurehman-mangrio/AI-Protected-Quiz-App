import asyncHandler from "express-async-handler";
import User from "./../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import multer from "multer";
import csv from "csv-parser";
import stream from "stream";

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to generate random password
const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Helper function to generate user ID
const generateUserId = (name, count) => {
  const cleanName = name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomNum}${count ? `_${count}` : ''}`;
};

// CSV Upload controller for Google Forms format
const uploadUsersCSV = asyncHandler(async (req, res) => {
  // Only teachers/admins can upload users
  if (req.user.role !== 'teacher') {
    res.status(403);
    throw new Error('Not authorized to upload users');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No CSV file uploaded');
  }

  const results = [];
  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  // Parse CSV file with Google Forms format
  return new Promise((resolve, reject) => {
    bufferStream
      .pipe(csv())
      .on('data', (data) => {
        // Map Google Forms columns to our user fields
        if (data['Full Name'] && data['Email Address'] && data['Phone Number (WhatsApp) ']) {
          const userData = {
            name: data['Full Name'].trim(),
            email: data['Email Address'].trim().toLowerCase(),
            phone: data['Phone Number (WhatsApp) '].trim(),
            university: data['University / Institution '] || '',
            department: data['Department / Program '] || '',
            academicYear: data['Academic Year / Experience Level '] || '',
          };
          results.push(userData);
        }
      })
      .on('end', async () => {
        try {
          const createdUsers = [];
          const errors = [];
          const skippedUsers = [];

          for (let i = 0; i < results.length; i++) {
            const userData = results[i];
            
            try {
              // Check if user already exists by email
              const existingUser = await User.findOne({ email: userData.email });
              if (existingUser) {
                skippedUsers.push(`User with email ${userData.email} already exists`);
                continue;
              }

              // Generate user ID from name
              let userId = generateUserId(userData.name);
              let count = 1;
              while (await User.findOne({ userId })) {
                userId = generateUserId(userData.name, count);
                count++;
              }

              // Generate username from email (before @ symbol)
              const username = userData.email.split('@')[0];
              let finalUsername = username;
              let usernameCount = 1;
              while (await User.findOne({ username: finalUsername })) {
                finalUsername = `${username}${usernameCount}`;
                usernameCount++;
              }

              // Generate random password
              const plainPassword = generateRandomPassword();
              
              // Create user with student role
              const user = await User.create({
                userId,
                username: finalUsername,
                name: userData.name,
                email: userData.email,
                password: plainPassword,
                role: 'student',
                phone: userData.phone,
                generatedPassword: plainPassword,
                university: userData.university,
                department: userData.department,
                academicYear: userData.academicYear,
              });

              createdUsers.push({
                userId: user.userId,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                generatedPassword: plainPassword,
                university: user.university,
                department: user.department,
                academicYear: user.academicYear
              });
            } catch (error) {
              errors.push(`Error creating user ${userData.email}: ${error.message}`);
            }
          }

          res.status(201).json({
            message: `CSV Processing Complete`,
            summary: {
              totalRecords: results.length,
              successCount: createdUsers.length,
              skippedCount: skippedUsers.length,
              errorCount: errors.length
            },
            createdUsers: createdUsers.slice(0, 10),
            skippedUsers: skippedUsers.slice(0, 10),
            errors: errors.length > 0 ? errors : undefined,
          });
        } catch (error) {
          res.status(500);
          reject(new Error(`Error processing CSV: ${error.message}`));
        }
      })
      .on('error', (error) => {
        res.status(400);
        reject(new Error(`CSV parsing error: ${error.message}`));
      });
  });
});

// Get users with generated passwords
const getUsersWithPasswords = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    res.status(403);
    throw new Error('Not authorized to view user passwords');
  }

  const users = await User.find({}).select('userId name email role phone generatedPassword university department academicYear createdAt');
  
  res.status(200).json({
    users: users.map(user => ({
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      generatedPassword: user.generatedPassword,
      university: user.university,
      department: user.department,
      academicYear: user.academicYear,
      createdAt: user.createdAt
    }))
  });
});

// Middleware for file upload
const uploadCSVMiddleware = upload.single('usersFile');

// ... REST OF YOUR EXISTING CODE (authUser, logoutUser, etc.) REMAINS THE SAME ...

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { login, password } = req.body; // Changed from 'email' to 'login'

  if (!login || !password) {
    res.status(400);
    throw new Error('Please provide login credentials and password');
  }

  // Find user by either email or userId
  const user = await User.findOne({
    $or: [
      { email: login },
      { userId: login }
    ]
  });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userId: user.userId, // Include userId in response
      role: user.role,
      password_encrypted: user.password,
      message: "User successfully logged in with role: " + user.role,
    });
  } else {
    res.status(401);
    throw new Error("Invalid login credentials or password");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(0),
  });
  res.status(200).json({ message: " User logout User" });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  res.status(200).json(user);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

const createUser = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    res.status(403);
    throw new Error('Not authorized to create users');
  }

  const { name, email, password, role, phone, university, department } = req.body;

  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  let userId = generateUserId(name);
  let count = 1;
  while (await User.findOne({ userId })) {
    userId = generateUserId(name, count);
    count++;
  }

  // Generate username from email
  const username = email.split('@')[0];
  let finalUsername = username;
  let usernameCount = 1;
  while (await User.findOne({ username: finalUsername })) {
    finalUsername = `${username}${usernameCount}`;
    usernameCount++;
  }

  const user = await User.create({
    userId,
    username: finalUsername,
    name,
    email,
    password: password || generateRandomPassword(),
    role,
    phone: phone || '',
    generatedPassword: password || generateRandomPassword(),
    university: university || '',
    department: department || ''
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      userId: user.userId,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      generatedPassword: user.generatedPassword,
      university: user.university,
      department: user.department,
      message: "User Successfully created with role: " + user.role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid User Data");
  }
});

const getUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    res.status(403);
    throw new Error('Not authorized to view users');
  }

  const users = await User.find({}).select('-password');
  res.status(200).json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    res.status(403);
    throw new Error('Not authorized to delete users');
  }

  const user = await User.findById(req.params.id);

  if (user) {
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot delete your own account');
    }

    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: 'User deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateUser = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    res.status(403);
    throw new Error('Not authorized to update users');
  }

  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.phone = req.body.phone || user.phone;
    user.university = req.body.university || user.university;
    user.department = req.body.department || user.department;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      userId: updatedUser.userId,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      university: updatedUser.university,
      department: updatedUser.department,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

export {
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  uploadUsersCSV,
  uploadCSVMiddleware,
  getUsersWithPasswords,
};