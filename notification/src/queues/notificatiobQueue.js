import { Queue } from "bullmq";
import redis from "../config/redis.js";

const notificationQueue = new Queue("notificationQueue", {
    connection: redis,
});

export default notificationQueue;