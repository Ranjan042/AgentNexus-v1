import express from "express";
import AgentGraph from "../agent/graph/graph.js";
import { success } from "zod";

const router = express.Router();


router.post("/run", async (req, res) => {

    try {

        const { task, sandboxId } = req.body;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        res.flushHeaders();

        const sendEvent = (event, data) => {
            res.write(
                `event: ${event}\n` +
                `data: ${JSON.stringify(data)}\n\n`
            );
        };

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
            if (mode == "updates") {
                sendEvent("agent_progress", {
                    data: chunk
                })
            }

            if (mode === "messages") {
                sendEvent("agent_message", {
                    data: chunk
                })
            }

            if (mode === "custom") {
                sendEvent("agent_custom", {
                    data: chunk
                })
            }


            if (mode === "completed") {
                sendEvent("agent_completed", {
                    data: chunk
                })
            }

            if (mode==="errors") {
                sendEvent("agent_error", {
                    data: chunk
                })
            }

            sendEvent("done",{
                success: true
            })
        }


        return res.status(200).json({
            success: true,
            result,
        });


    } catch (error) {


        if (mode == "errors") {
            sendEvent("agent_error", {
                data: chunk
            })
        }
        console.error("Agent Graph Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


export default router;