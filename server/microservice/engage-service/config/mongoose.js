import mongoose from 'mongoose';
import { config } from './config.js';

const connectDB = async () => {
  try {
    if (!config.db) {
      throw new Error('MongoDB URI is undefined. Set ENGAGE_MONGO_URI.');
    }
    await mongoose.connect(config.db);
    console.log(`✅ Engage service connected to MongoDB`);
  } catch (error) {
    console.error('❌ Engage service MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
