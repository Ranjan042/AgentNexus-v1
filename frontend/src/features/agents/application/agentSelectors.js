export const selectAgent = (state) => state.agent
export const selectAgentStatus = (state) => state.agent.status
export const selectAgentTask = (state) => state.agent.task
export const selectAgentProgress = (state) => state.agent.progress
export const selectAgentMessages = (state) => state.agent.messages
export const selectAgentToolCalls = (state) => state.agent.toolCalls
export const selectAgentEvents = (state) => state.agent.events || []
export const selectAgentResults = (state) => state.agent.results || []
export const selectAgentError = (state) => state.agent.error
export const selectAgentCurrentAgent = (state) => state.agent.currentAgent
export const selectAgentNextAgent = (state) => state.agent.nextAgent
export const selectAgentStartedAt = (state) => state.agent.startedAt
export const selectAgentCompletedAt = (state) => state.agent.completedAt
