import app from './src/app.js';
import connectDB from './src/config/database.js';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('Failed to establish MongoDB connection:', err.message);
});

const server = app.listen(PORT, () => {
  console.log(`Auth service is running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
