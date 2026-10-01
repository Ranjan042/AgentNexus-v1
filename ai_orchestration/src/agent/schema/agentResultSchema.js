import { z } from "zod";

export const AgentResultSchema = z.object({
    success: z.boolean(),

    agent: z.string(),


    summary: z.string(),


    actions: z.array(
        z.object({
            type: z.enum([
                "file_read",
                "file_create",
                "file_update",
                "file_delete",
                "file_move",
                "search_files",
                "search_internet",
                "terminal",
            ]),
            target: z.string().optional(),
            description: z.string(),
        })
    ).default([]),

    errors: z.array(
        z.object({
            message: z.string(),
            type: z.string().optional(),
        })
    ).default([]),

    nextSteps: z.array(z.string()).default([]),

    // metadata: z.record(z.string(), z.any()).default({}),
});