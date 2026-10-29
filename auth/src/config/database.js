import dns from 'dns';
import 'dotenv/config';
import mongoose from 'mongoose';

// Configure DNS resolvers for environments with restricted local DNS lookup (e.g., MongoDB Atlas SRV)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  console.warn('DNS server override failed, using default system DNS:', err.message);
}

/**
 * Connects to MongoDB database using connection string from environment variables.
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('MONGO_URI is not defined in environment variables. Database connection skipped.');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw err;
  }
};

export default connectDB;
