import notificationQueue from "../queues/notificatiobQueue.js";
import { Router } from "express";

export const router = Router();

router.post("/send-notification", async (req, res) => {
    try {
        const { recipient, message, subject, channel } = req.body;

        const job = await notificationQueue.add("sendNotification", {
            recipient,
            message,
            subject,
            channel,
        }, {
            attempts: 3, // Number of retry attempts
            backoff: {
                type: "exponential",
                delay: 5000, // Initial delay of 5 seconds
            },
            removeOnComplete: true, // Remove job from queue on successful completion
            removeOnFail: false, // Keep job in queue on failure for debugging
        });

        return res.status(202).json({
            status: "success",
            message: "Notification job added to the queue",
            jobId: job.id,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to add notification job to the queue",
            error: error.message,
        });
    }
})
