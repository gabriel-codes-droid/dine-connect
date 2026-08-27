import mongoose from 'mongoose';

let connectionPromise;

export function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!connectionPromise) {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dineconnect';
    connectionPromise = mongoose.connect(mongoURI)
      .then((connection) => {
        console.log('[dineconnect] MongoDB connected');
        return connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}
