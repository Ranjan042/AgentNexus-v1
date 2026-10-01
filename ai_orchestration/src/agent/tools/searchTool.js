import "dotenv/config";

import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const SearchOnInternetTool = tool(
    async ({ query }, config) => {
        try {
            console.log("Using search tool");

            const tavily = new TavilySearch({
                maxResults: 5,
                apiKey: process.env.TAVILY_API_KEY,
                topic: "search",
            });

            const result = await tavily.search(query);

            return result;

        } catch (error) {
            throw new Error(
                `Error searching on internet: ${error.message}`
            );
        }
    },
    {
        name: "search_internet",

        description:
            "Search the internet for current information, documentation, technical solutions, and relevant web content.",

        schema: z.object({
            query: z
                .string()
                .min(1)
                .describe("The search query to search on the internet"),
        }),
    }
);