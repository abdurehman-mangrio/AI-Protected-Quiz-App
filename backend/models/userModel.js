import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      sparse: true
    },
    username: {
      type: String,
      unique: true,
      sparse: true // This allows multiple null values
    },
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      require: true,
    },
    phone: {
      type: String,
      default: '',
    },
    generatedPassword: {
      type: String,
      default: ''
    },
    // Hackathon specific fields
    university: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    academicYear: {
      type: String,
      default: ''
    },
    participationType: {
      type: String,
      default: ''
    },
    previousParticipation: {
      type: String,
      default: ''
    },
    technicalSkills: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;