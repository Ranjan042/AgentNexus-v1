import { StateGraph, START, END } from "@langchain/langgraph";

import { AgentState } from "../state/agentState.js";

import {
    SupervisorNode,
    ReviewNode,
    CodeNode,
    DebugNode,
    ResearchNode,
} from "../node/nodes.js";


const supervisorRouter = (state) => {
    console.log("========== ROUTER ==========");
    console.log("state.nextAgent:", state.nextAgent);

    if (state.nextAgent === "finish") {
        console.log("➡️ END");
        return END;
    }

    console.log("➡️ ROUTING TO:", state.nextAgent);

    return state.nextAgent;
};


export const graph = new StateGraph(AgentState)

    // Nodes
    .addNode("supervisor", SupervisorNode)
    .addNode("research", ResearchNode)
    .addNode("code", CodeNode)
    .addNode("debug", DebugNode)
    .addNode("review", ReviewNode)

    // START → Supervisor
    .addEdge(START, "supervisor")

    // Supervisor → Worker / END
    .addConditionalEdges(
        "supervisor",
        supervisorRouter,
        {
            research: "research",
            code: "code",
            debug: "debug",
            review: "review",
            finish: END,
        }
    )

    // Worker → Supervisor
    .addEdge("research", "supervisor")
    .addEdge("code", "supervisor")
    .addEdge("debug", "supervisor")
    .addEdge("review", "supervisor");


const AgentGraph = graph.compile();

export default AgentGraph;