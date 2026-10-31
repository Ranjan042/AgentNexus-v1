import express from "express";
import AgentGraph from "../agent/graph/graph.js";
import { requireAgentAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/run", requireAgentAuth, async (req, res) => {
    const { task, sandboxId } = req.body || {};

    if (!task) {
        return res.status(400).json({
            success: false,
            message: "Task is required",
        });
    }

    if (!sandboxId) {
        return res.status(400).json({
            success: false,
            message: "Sandbox ID is required",
        });
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable buffering in Nginx Ingress

    res.flushHeaders();

    const sendEvent = (event, data) => {
        try {
            res.write(
                `event: ${event}\n` +
                `data: ${JSON.stringify(data)}\n\n`
            );
        } catch (err) {
            console.error("Failed to write SSE event:", err.message);
        }
    };

    // Heartbeat to keep connection alive through proxies
    const heartbeat = setInterval(() => {
        try {
            res.write(": heartbeat\n\n");
        } catch {
            clearInterval(heartbeat);
        }
    }, 15000);

    req.on("close", () => {
        clearInterval(heartbeat);
    });

    try {
        const initialState = {
            task,
            agentTask: "",
            messages: [],
            currentAgent: "supervisor",
            nextAgent: "research",
            agentResult: null,
            agentResults: [],
            sandboxId,
            completed: false,
            errors: [],
        };

        const stream = await AgentGraph.stream(
            initialState,
            {
                configurable: {
                    sandboxId,
                },
                streamMode: ["updates", "messages", "custom", "errors"],
            }
        );

        for await (const [mode, chunk] of stream) {
            if (mode === "updates") {
                sendEvent("agent_progress", {
                    data: chunk,
                });
            } else if (mode === "messages") {
                sendEvent("agent_message", {
                    data: chunk,
                });
            } else if (mode === "custom") {
                sendEvent("agent_custom", {
                    data: chunk,
                });
            } else if (mode === "completed") {
                sendEvent("agent_completed", {
                    data: chunk,
                });
            } else if (mode === "errors") {
                sendEvent("agent_error", {
                    data: chunk,
                });
            }
        }

        clearInterval(heartbeat);

        sendEvent("done", {
            success: true,
        });

        res.end();

    } catch (error) {
        clearInterval(heartbeat);
        console.error("Agent Graph Execution Error:", error);

        sendEvent("agent_error", {
            message: error.message || "An error occurred during agent execution",
        });

        sendEvent("done", {
            success: false,
            error: error.message,
        });

        res.end();
    }
});

export default router;
