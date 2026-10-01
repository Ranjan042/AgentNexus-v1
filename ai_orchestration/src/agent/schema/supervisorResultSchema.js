import { z } from "zod";

export const SupervisorDecisionSchema = z.object({
  nextAgent: z.enum([
    "research",
    "code",
    "debug",
    "review",
    "finish",
  ]),

  reasoning: z.string(),

  context: z.string().optional(),

  agentTask: z.string().optional(),

  priority: z.enum([
    "low",
    "medium",
    "high",
  ]).default("medium"),
});