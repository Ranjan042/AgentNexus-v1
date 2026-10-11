import { createSlice } from '@reduxjs/toolkit'
import { AGENT_STATUS } from './agentTypes'
import { runAgent } from '../application/agentThunks'

const initialState = {
  status: AGENT_STATUS.IDLE,
  task: '',
  currentAgent: null,
  nextAgent: null,
  progress: [],
  messages: [],
  toolCalls: [],
  results: [],
  startedAt: null,
  completedAt: null,
  completed: false,
  error: null,
}

function upsertToolCall(list, incoming) {
  const index = list.findIndex((item) => item.id === incoming.id && item.tool === incoming.tool)
  if (index >= 0) {
    list[index] = { ...list[index], ...incoming }
    return
  }
  list.push(incoming)
}

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    setTask(state, action) {
      state.task = action.payload
    },
    applyProgress(state, action) {
      state.progress.push(action.payload)
      state.currentAgent = action.payload.agent
      state.nextAgent = action.payload.nextAgent
      state.status = AGENT_STATUS.RUNNING
    },
    applyMessages(state, action) {
      state.messages.push(...(action.payload.messages || []))
      ;(action.payload.toolCalls || []).forEach((call) => {
        upsertToolCall(state.toolCalls, call)
      })
    },
    appendResult(state, action) {
      state.results.push(action.payload)
    },
    setStreamError(state, action) {
      state.error = typeof action.payload === 'string' ? action.payload : String(action.payload)
      state.status = AGENT_STATUS.ERROR
    },
    markCompleted(state) {
      state.status = AGENT_STATUS.COMPLETED
      state.completed = true
      state.completedAt = Date.now()
    },
    resetAgent(state) {
      return { ...initialState, task: state.task }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runAgent.pending, (state, action) => {
        const task = action.meta.arg || state.task
        Object.assign(state, {
          ...initialState,
          task,
          status: AGENT_STATUS.CONNECTING,
          startedAt: Date.now(),
        })
      })
      .addCase(runAgent.fulfilled, (state) => {
        state.status = AGENT_STATUS.COMPLETED
        state.completed = true
        state.completedAt = Date.now()
      })
      .addCase(runAgent.rejected, (state, action) => {
        if (action.payload?.message === 'cancelled') {
          state.status = AGENT_STATUS.CANCELLED
          return
        }
        state.status = AGENT_STATUS.ERROR
        state.error = action.payload?.message || 'Agent run failed'
      })
  },
})

export const {
  setTask,
  applyProgress,
  applyMessages,
  appendResult,
  setStreamError,
  markCompleted,
  resetAgent,
} = agentSlice.actions

export default agentSlice.reducer
