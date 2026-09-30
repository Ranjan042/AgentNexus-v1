import express from "express"
import morgan from "morgan"
import { SupervisorAgent } from "./agent/agents/supervisorAgent.js";


const app=express();

app.use(morgan("dev"));
app.use(express.json());

app.post("/api/agent", async (req, res) => {
    try {
        console.log("Agent API called");
        const { task, sandboxId } = req.body;

        const state = {
            messages: [
                {
                    role: "user",
                    content: task,
                },
            ],
        };

        const config = {
            configurable: {
                sandboxId,
            },
        };

        const result = await SupervisorAgent(state, config);
        console.log("Agent result:", result);
        res.json({
            success: true,
            result,
        });

    } catch (error) {
        console.error("Agent API Error:", error);

        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

export default app;