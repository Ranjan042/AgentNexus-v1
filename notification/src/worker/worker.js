import { Worker } from "bullmq";
import redis from "../config/redis.js";
import Transporter from "../config/nodemailer.js";

console.log("Initializing Notification Worker...");

const worker = new Worker(
    "notificationQueue",
    async (job) => {
        console.log(`Processing job ${job.id}`);

        const { recipient, subject, message, channel } = job.data;

        if (channel === "email") {
            const info = await Transporter.sendMail({
                from: `"Notification Server" <${process.env.SMTP_USER}>`,
                to: recipient,
                subject,
                text: message,
            });

            console.log("Email accepted:", info.messageId);

            return { messageId: info.messageId };
        }

        if (channel === "sms") {
            console.log("SMS feature not implemented");
            return;
        }

        throw new Error(`Unsupported channel: ${channel}`);
    },
    {
        connection: redis,
        concurrency: 5,
    }
);

worker.on("ready", () => {
    console.log("Notification Worker is READY!");
});

worker.on("active", (job) => {
    console.log("Job active:", job.id);
});

worker.on("waiting", (jobId) => {
    console.log("Job waiting:", jobId);
});

worker.on("completed", (job) => {
    console.log("Job completed:", job.id);
});

worker.on("failed", (job, err) => {
    console.error("Job failed:", job?.id, err);
});

worker.on("error", (err) => {
    console.error("Worker error:", err);
});

export default worker;