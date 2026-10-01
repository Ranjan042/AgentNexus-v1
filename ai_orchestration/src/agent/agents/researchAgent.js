import "dotenv/config";
import {SearchOnInternetTool} from "../tools/searchTool.js";
import {ListFilesTool, ReadFilesTool} from "../tools/fileTools.js";
import {createAgent} from "langchain"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {AgentResultSchema} from "../schema/agentResultSchema.js";

const model= new ChatGoogleGenerativeAI({
    model:"gemini-3.5-flash-lite",
    temperature:0.7,
    apiKey: process.env.GEMINI_API_KEY,
});

const researchTools=[
    SearchOnInternetTool,
    ListFilesTool,
    ReadFilesTool
]



export const researchAgent= createAgent({
    tools: researchTools,
    model,
    responseFormat: AgentResultSchema
})