import Redis from "ioredis"


const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
})

redis.on("connect", () => {
  console.log("Redis connecting...");
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

redis.on("ready", () => {
    console.log("Redis connected successfully");
});


export const connectRedis = async () => {
    if (!redis.isOpen) {
        await redis.connect();
    }
};

export default redis;