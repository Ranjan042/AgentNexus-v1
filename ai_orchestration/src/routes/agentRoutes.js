import express from "express";
import AgentGraph from "../agent/graph/graph.js";

const router = express.Router();


router.post("/run", async (req, res) => {

    try {

        const { task, sandboxId } = req.body;

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


        const result = await AgentGraph.invoke(
            initialState,
            {
                configurable: {
                    sandboxId,
                },
            }
        );


        return res.status(200).json({
            success: true,
            result,
        });


    } catch (error) {

        console.error("Agent Graph Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


export default router;