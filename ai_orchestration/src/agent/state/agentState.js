import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({

  // Original user request
  task: Annotation({
    reducer: (_, value) => value,
    default: () => "",
  }),

  iteration: Annotation({
    reducer: (_, value) => value,
    default: () => 0,
  }),

  // Conversation between user, supervisor and agents
  messages: Annotation({
    reducer: (current, incoming) => [
      ...current,
      ...incoming,
    ],
    default: () => [],
  }),

  // Current agent executing the task
  currentAgent: Annotation({
    reducer: (_, value) => value,
    default: () => "supervisor",
  }),

    agentTask: Annotation({
        reducer: (_, value) => value,
        default: () => "",
    }),

  // Agent that supervisor wants to execute next
  nextAgent: Annotation({
    reducer: (_, value) => value,
    default: () => "supervisor",
  }),

  // Result returned by the currently executed agent
  agentResult: Annotation({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Results from all agents
  agentResults: Annotation({
    reducer: (current, incoming) => [
      ...current,
      incoming,
    ],
    default: () => [],
  }),

  // Sandbox information
  sandboxId: Annotation({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Whether the overall task is completed
  completed: Annotation({
    reducer: (_, value) => value,
    default: () => false,
  }),

  // Global errors
  errors: Annotation({
    reducer: (current, incoming) => [
      ...current,
      ...incoming,
    ],
    default: () => [],
  }),
});