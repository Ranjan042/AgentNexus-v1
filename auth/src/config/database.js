import dns from 'dns';
import 'dotenv/config';
import mongoose from 'mongoose';

// Configure DNS resolvers. In restricted environments (e.g., Docker/Kubernetes/Atlas SRV),
// system DNS or public resolvers (8.8.8.8, 1.1.1.1) ensure SRV record resolution works reliably.
if (process.env.DNS_SERVERS) {
  try {
    const servers = process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean);
    dns.setServers(servers);
    console.log(`Configured custom DNS resolvers: ${servers.join(', ')}`);
  } catch (err) {
    console.warn('Failed to set custom DNS servers from DNS_SERVERS env:', err.message);
  }
} else {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (err) {
    console.warn('DNS server override failed, using default system DNS:', err.message);
  }
}

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 1,
};

let isConnecting = false;

// Connection event listeners for automatic visibility and health monitoring
mongoose.connection.on('connected', () => {
  console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database.');
});

/**
 * Connects to MongoDB database using connection string from environment variables.
 * Includes automated retry logic and clear diagnostics for Atlas network access.
 *
 * @param {number} retryCount
 * @param {number} maxRetries
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (retryCount = 0, maxRetries = 5) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('[MongoDB] CRITICAL: MONGO_URI is not defined in environment variables.');
    return null;
  }

  if (isConnecting) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose));
      mongoose.connection.once('error', (err) => reject(err));
    });
  }

  isConnecting = true;

  try {
    const conn = await mongoose.connect(mongoUri, MONGO_OPTIONS);
    isConnecting = false;
    return conn;
  } catch (err) {
    isConnecting = false;
    console.error(
      `[MongoDB] Connection error (attempt ${retryCount + 1}/${maxRetries}): ${err.message}`
    );

    // Provide immediate diagnosis for Atlas firewall / IP whitelist issues
    if (
      err.message.includes('buffering timed out') ||
      err.message.includes('Server selection timed out') ||
      err.name === 'MongooseServerSelectionError' ||
      err.code === 'ECONNREFUSED'
    ) {
      console.error(
        '\n============================================================\n' +
        '⚠️  [ATLAS IP WHITELIST DIAGNOSTIC]  ⚠️\n' +
        'The container cannot reach MongoDB Atlas cluster.\n' +
        'Most Common Cause:\n' +
        '  The Kubernetes pod or container outbound IP is not allowed\n' +
        '  in MongoDB Atlas Network Access.\n' +
        'Solution:\n' +
        '  1. Log into https://cloud.mongodb.com\n' +
        '  2. Go to: Security -> Network Access -> IP Access List\n' +
        '  3. Click "+ Add IP Address" and select "Allow Access From Anywhere"\n' +
        '     (IP: 0.0.0.0/0)\n' +
        '============================================================\n'
      );
    }

    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`[MongoDB] Retrying connection in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retryCount + 1, maxRetries);
    }

    if (process.env.NODE_ENV === 'production') {
      console.error('[MongoDB] Max retries reached. Production startup halted.');
    }
    throw err;
  }
};

/**
 * Checks if MongoDB is currently in connected state (readyState === 1).
 */
export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Ensures MongoDB is connected, attempting on-demand reconnect if needed.
 */
export async function ensureDatabaseConnected() {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  try {
    await connectDB(0, 2);
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}

export default connectDB;
