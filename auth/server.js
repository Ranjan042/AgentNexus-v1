import mongoose from 'mongoose';
import app from './src/app.js';
import connectDB from './src/config/database.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.warn(
      `[Auth Service] Started with MongoDB disconnected (${err.message}). Background retries will continue.`
    );
  }

  const server = app.listen(PORT, () => {
    console.log(`Auth service is running on http://localhost:${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} signal received: closing HTTP server`);
    server.close(async () => {
      console.log('HTTP server closed');
      try {
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
      } catch (err) {
        console.error('Error closing MongoDB connection:', err.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

const server = await start();

export default server;
