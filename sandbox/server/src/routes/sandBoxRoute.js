import {Router} from "express";
import {createPods} from "../kubernetes/pod.js";
import {createService} from "../kubernetes/service.js";
import {v7 as uuid} from "uuid";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello from sandbox");
});

router.post("/start",async (req, res) => {
    try {
        const sandboxId = uuid();

        await Promise.all([createPods(sandboxId), createService(sandboxId)]);

        return res.status(200).json({
            message: "Sandbox Environment started successfully",
            sandboxId,
            previewUrl: `http://sandbox-${sandboxId}.preview.localhost`
        })
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});

export default router;