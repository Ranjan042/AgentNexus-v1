import { supervisorAgent } from "../agents/supervisorAgent.js";
import { reviewAgent } from "../agents/reviewAgent.js";
import { codeAgent } from "../agents/codeAgent.js";
import { debugAgent } from "../agents/debugAgent.js";
import { researchAgent } from "../agents/researchAgent.js";

export const SupervisorNode = async (state, config) => {
    try {
        const iteration = state.iterations + 1;

        console.log("========== SUPERVISOR ==========");
        console.log("Iteration:", iteration);

        if (iteration >= 10) {
            console.log("⚠️ MAX ITERATIONS REACHED");

            return {
                iterations: iteration,
                nextAgent: "finish",
            };
        }
        const response = await supervisorAgent.invoke(
            {
                messages: [
                    {
                        role: "user",
                        content: state.task
                    },
                    // ...state.messages,
                ]
            },
            {
                configurable: {
                    ...config?.configurable,
                    sandboxId: state.sandboxId,
                },
            }

        );



        const decision = response.structuredResponse;

        console.log("Supervisor Decision:", decision);

        if (!decision) {
            throw new Error("No decision made by supervisor agent");
        }

        return {
            currentAgent: "supervisor",
            nextAgent: decision.nextAgent,
            agentResult: decision,
            agentResults: decision,
            agentTask: decision.agentTask || "",
            messages: [
                {
                    role: "assistant",
                    content: decision.reasoning
                }
            ]
        }


    } catch (error) {
        return {
            currentAgent: "supervisor",
            errors: [
                {
                    message: error.message,
                    type: "supervisor_error"
                }
            ]
        }

    }
}

export const CodeNode = async (state, config) => {
    try {
        console.log("🔥 CODE NODE ENTERED");
        console.log("🔥 STATE", state);

        const response = await codeAgent.invoke(
            {
                messages: [
                    {
                        role: "user",
                        content: state.agentTask,
                    },
                    // ...state.messages,
                ]

            },
            {
                configurable: {
                    ...config?.configurable,
                    sandboxId: state.sandboxId,
                    task: state.task,
                },
            }

        );

        const decision = response.structuredResponse;

        console.log("Code Decision:", decision);

        if (!decision) {
            throw new Error("No decision made by code agent");
        }

        return {
            currentAgent: "code",
            agentResult: decision,
            agentResults: decision,
            messages: [
                {
                    role: "assistant",
                    content: decision.summary
                }
            ],
            errors: decision.errors || [],
        }
    }
    catch (error) {
        console.error("Code Node Error:", error);
        return {
            currentAgent: "code",
            errors: [
                {
                    message: error.message,
                    type: "code_error"
                }
            ]
        }
    }
}

export const DebugNode = async (state, config) => {
    try {
        const response = await debugAgent.invoke(
            {
                messages: [
                    {
                        role: "assistant",
                        content: state.agentTask
                    },
                    // ...state.messages,
                ]
            },
            {
                configurable: {
                    ...config?.configurable,
                    sandboxId: state.sandboxId,
                },
            }

        );

        const decision = response.structuredResponse;

        console.log("Debug Decision:", decision);

        if (!decision) {
            throw new Error("No decision made by debug agent");
        }

        return {
            currentAgent: "debug",
            agentResult: decision,
            agentResults: decision,
            messages: [
                {
                    role: "assistant",
                    content: decision.summary
                }
            ],
        }
    }
    catch (error) {
        return {
            currentAgent: "debug",
            errors: [
                {
                    message: error.message,
                    type: "debug_error"
                }
            ]
        }
    }
}

export const ReviewNode = async (state, config) => {
    try {
        const response = await reviewAgent.invoke(
            {
                messages: [
                    {
                        role: "user",
                        content: state.agentTask
                    },
                    // ...state.messages,
                ]
            },
            {
                configurable: {
                    ...config?.configurable,
                    sandboxId: state.sandboxId,
                },
            }

        );

        const decision = response.structuredResponse;

        console.log("Review Decision:", decision);

        if (!decision) {
            throw new Error("No decision made by review agent");
        }

        return {
            currentAgent: "review",
            agentResult: decision,
            agentResults: decision,
            messages: [
                {
                    role: "assistant",
                    content: decision.summary
                }
            ],
            errors: decision.errors || [],
        }
    }
    catch (error) {
        return {
            currentAgent: "review",
            errors: [
                {
                    message: error.message,
                    type: "review_error"
                }
            ]
        }
    }
}

export const ResearchNode = async (state, config) => {
    try {
        const response = await researchAgent.invoke(
            {
                messages: [
                    {
                        role: "user",
                        content: state.agentTask
                    },
                    // ...state.messages,
                ]
            },
            {
                configurable: {
                    ...config?.configurable,
                    sandboxId: state.sandboxId,
                },
            }

        );

        const decision = response.structuredResponse;

        console.log("Research Decision:", decision);

        if (!decision) {
            throw new Error("No decision made by research agent");
        }

        return {
            currentAgent: "research",
            agentResult: decision,
            agentResults: decision,
            messages: [
                {
                    role: "assistant",
                    content: decision.summary
                }
            ],
            errors: decision.errors || [],
        }
    }
    catch (error) {
        return {
            currentAgent: "research",
            errors: [
                {
                    message: error.message,
                    type: "research_error"
                }
            ]
        }
    }
}


