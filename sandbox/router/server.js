import server from './src/app.js';
import connectDB from './src/config/database.js';
import { connectRedis } from './src/config/redis.js';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB to enable sandbox ownership verification
connectDB().catch((err) => {
  console.error('Failed to establish MongoDB connection for Router Service:', err.message);
});

connectRedis().catch((err)=>{
  console.log("Redis db connection error")
})
server.listen(PORT, () => {
  console.log(`Router service running on port ${PORT}`);
});
