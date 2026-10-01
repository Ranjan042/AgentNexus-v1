import { StateGraph, START, END } from "@langchain/langgraph";

import { AgentState } from "../state/agentState.js";

import {
  SupervisorNode,
  ReviewNode,
  CodeNode,
  DebugNode,
  ResearchNode,
} from "../node/nodes.js";

/* =========================================================
   SUPERVISOR ROUTER
   ========================================================= */

const supervisorRouter = (state) => {
  console.log("========== SUPERVISOR ROUTER ==========");
  console.log("state.nextAgent:", state.nextAgent);

  return state.nextAgent;
};

/* =========================================================
   REVIEW ROUTER
   ========================================================= */

const reviewRouter = (state) => {
  console.log("========== REVIEW ROUTER ==========");
  console.log("state.nextAgent:", state.nextAgent);

  return state.nextAgent;
};

/* =========================================================
   GRAPH
   ========================================================= */

const graph = new StateGraph(AgentState)

  /* =========================
     NODES
     ========================= */

  .addNode("supervisor", SupervisorNode)
  .addNode("research", ResearchNode)
  .addNode("code", CodeNode)
  .addNode("debug", DebugNode)
  .addNode("review", ReviewNode)

  /* =========================
     START → SUPERVISOR
     ========================= */

  .addEdge(START, "supervisor")

  /* =========================
     SUPERVISOR → WORKER
     ========================= */

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

  /* =========================
     REVIEW → FINISH / SUPERVISOR
     ========================= */

  .addConditionalEdges(
    "review",
    reviewRouter,
    {
      finish: END,
      supervisor: "supervisor",
    }
  )

  /* =========================
     WORKERS → SUPERVISOR
     ========================= */

  .addEdge("research", "supervisor")
  .addEdge("code", "supervisor")
  .addEdge("debug", "supervisor");

  /*
    IMPORTANT:

    DO NOT ADD:

    .addEdge("review", "supervisor")

    because review already has conditional edges above.
  */

/* =========================================================
   COMPILE
   ========================================================= */

const AgentGraph = graph.compile();

export default AgentGraph;