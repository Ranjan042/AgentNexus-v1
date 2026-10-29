import app from './src/app.js';
import connectDB from './src/config/database.js';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('Failed to establish MongoDB connection for Sandbox Service:', err.message);
});

const server = app.listen(PORT, () => {
  console.log(`Sandbox Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing Sandbox Service');
  server.close(() => {
    console.log('Sandbox Service HTTP server closed');
  });
});

export default server;
