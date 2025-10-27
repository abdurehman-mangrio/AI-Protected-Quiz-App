import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Use MONGODB_URI instead of MONGO_URL
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;