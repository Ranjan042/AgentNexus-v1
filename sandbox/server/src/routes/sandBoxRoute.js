import {Router} from "express";
import {createPods} from "../kubernetes/pod.js";
import {createService} from "../kubernetes/service.js";
import {v7 as uuid} from "uuid";

const router = Router();

router.get("/health", (req, res) => {
    res.send("Sandbo health is ok");
});

router.post("/start", async (req, res) => {
    try {
        const sandboxId = uuid();

        console.log("Starting sandbox:", sandboxId);

        // 1. Create Pod
        console.log("Creating Pod...");
        await createPods(sandboxId);
        console.log("Pod creation completed");

        // 2. Create Service
        console.log("Creating Service...");
        await createService(sandboxId);
        console.log("Service creation completed");

        console.log("Sandbox Environment started successfully");

        return res.status(200).json({
            message: "Sandbox Environment started successfully",
            sandboxId,
            previewUrl: `http://sandbox-${sandboxId}.preview.localhost`
        });

    } catch (error) {
        console.error("Sandbox start failed:", error);

        return res.status(500).json({
            message: error.message
        });
    }
});

export default router;