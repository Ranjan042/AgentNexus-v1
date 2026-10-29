import server from './src/app.js';
import connectDB from './src/config/database.js';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB to enable sandbox ownership verification
connectDB().catch((err) => {
  console.error('Failed to establish MongoDB connection for Router Service:', err.message);
});

server.listen(PORT, () => {
  console.log(`Router service running on port ${PORT}`);
});
