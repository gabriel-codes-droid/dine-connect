import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dineconnect';
    await mongoose.connect(mongoURI);
    console.log('[dineconnect] MongoDB connected');
  } catch (err) {
    console.error('[dineconnect] MongoDB connection error:', err.message);
    process.exit(1);
  }
}
