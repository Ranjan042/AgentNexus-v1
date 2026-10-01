import {ListFilesTool, ReadFilesTool, UpdateFilesTool, MoveFilesTool, SearchFilesTool} from "../tools/fileTools.js";
import {createAgent} from "langchain"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {AgentResultSchema} from "../schema/agentResultSchema.js";

const model= new ChatGoogleGenerativeAI({
    model:"gemini-3.5-flash-lite",
    temperature:0.7,
    apiKey: process.env.GEMINI_API_KEY,
});

const debugTools=[
    ListFilesTool,
    ReadFilesTool,
    UpdateFilesTool,
    MoveFilesTool,
    SearchFilesTool
]

export const debugAgent= createAgent({
    tools: debugTools,
    model,
    responseFormat: AgentResultSchema
})
