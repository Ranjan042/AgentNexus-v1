import dns from 'dns';
import mongoose from 'mongoose';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch {
  // Ignore DNS override errors
}

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('MONGO_URI is not set. Sandbox Router running without direct DB ownership cache.');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`Router DB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('Router DB connection error:', err.message);
    return null;
  }
};

export default connectDB;
