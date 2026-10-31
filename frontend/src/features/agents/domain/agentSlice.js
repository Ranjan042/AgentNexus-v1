import { createSlice } from '@reduxjs/toolkit'
import { AGENT_STATUS } from './agentTypes'
import { runAgent } from '../application/agentThunks'
import { createId } from '../../../shared/utils/id'

const initialState = {
  status: AGENT_STATUS.IDLE,
  task: '',
  currentAgent: null,
  nextAgent: null,
  progress: [],
  messages: [],
  toolCalls: [],
  results: [],
  events: [],
  startedAt: null,
  completedAt: null,
  completed: false,
  error: null,
}

function upsertToolCall(list, incoming) {
  const index = list.findIndex(
    (item) =>
      (incoming.id && item.id === incoming.id) ||
      (incoming.tool && item.tool === incoming.tool && item.status === 'running')
  )

  if (index >= 0) {
    const existing = list[index]
    const updated = {
      ...existing,
      ...incoming,
      id: incoming.id || existing.id,
      tool: incoming.tool || existing.tool,
      input: incoming.input && Object.keys(incoming.input).length > 0 ? incoming.input : existing.input,
      output: incoming.output !== null && incoming.output !== undefined ? incoming.output : existing.output,
      status: incoming.status || existing.status,
      timestamp: existing.timestamp || incoming.timestamp || Date.now(),
      completedAt: incoming.status === 'completed' ? incoming.timestamp || Date.now() : existing.completedAt,
    }
    list[index] = updated
    return updated
  }

  const created = {
    ...incoming,
    timestamp: incoming.timestamp || Date.now(),
  }
  list.push(created)
  return created
}

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    setTask(state, action) {
      state.task = action.payload
    },
    applyProgress(state, action) {
      const p = action.payload
      state.progress.push(p)
      state.currentAgent = p.agent
      state.nextAgent = p.nextAgent
      state.status = AGENT_STATUS.RUNNING

      state.events.push({
        id: p.id || createId('evt_step'),
        kind: 'progress',
        agent: p.agent,
        nextAgent: p.nextAgent,
        task: p.task,
        result: p.result,
        actions: p.result?.actions || [],
        nextSteps: p.result?.nextSteps || [],
        reasoning: p.result?.reasoning || '',
        priority: p.result?.priority || null,
        timestamp: p.timestamp || Date.now(),
      })
    },
    applyMessages(state, action) {
      const { messages = [], toolCalls = [] } = action.payload || {}

      state.messages.push(...messages)
      messages.forEach((msg) => {
        state.events.push({
          id: msg.id || createId('evt_msg'),
          kind: 'message',
          agent: state.currentAgent || 'assistant',
          role: msg.role || 'assistant',
          content: msg.content,
          timestamp: msg.timestamp || Date.now(),
        })
      })

      toolCalls.forEach((call) => {
        const updated = upsertToolCall(state.toolCalls, call)

        const evtIndex = state.events.findIndex(
          (e) =>
            e.kind === 'tool_call' &&
            ((updated.id && e.id === updated.id) ||
              (updated.tool && e.tool === updated.tool && e.status === 'running'))
        )

        if (evtIndex >= 0) {
          const existing = state.events[evtIndex]
          state.events[evtIndex] = {
            ...existing,
            ...updated,
            kind: 'tool_call',
            agent: state.currentAgent || existing.agent || 'agent',
          }
        } else {
          state.events.push({
            ...updated,
            kind: 'tool_call',
            agent: state.currentAgent || 'agent',
          })
        }
      })
    },
    appendResult(state, action) {
      state.results.push(action.payload)
      state.events.push({
        id: action.payload.id || createId('evt_res'),
        kind: 'result',
        agent: state.currentAgent || 'system',
        content: action.payload.content,
        timestamp: action.payload.timestamp || Date.now(),
      })
    },
    setStreamError(state, action) {
      state.error = typeof action.payload === 'string' ? action.payload : String(action.payload)
      state.status = AGENT_STATUS.ERROR
      state.events.push({
        id: createId('evt_err'),
        kind: 'error',
        agent: state.currentAgent || 'system',
        message: state.error,
        timestamp: Date.now(),
      })
    },
    markCompleted(state) {
      state.status = AGENT_STATUS.COMPLETED
      state.completed = true
      state.completedAt = Date.now()
      const duration = state.startedAt ? Date.now() - state.startedAt : null

      state.events.push({
        id: createId('evt_comp'),
        kind: 'completed',
        agent: 'system',
        duration,
        timestamp: Date.now(),
      })
    },
    clearEvents(state) {
      state.events = []
      state.progress = []
      state.messages = []
      state.toolCalls = []
      state.results = []
      state.error = null
      state.status = AGENT_STATUS.IDLE
      state.currentAgent = null
      state.nextAgent = null
      state.startedAt = null
      state.completedAt = null
      state.completed = false
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
          events: [
            {
              id: createId('evt_start'),
              kind: 'start',
              agent: 'supervisor',
              task,
              timestamp: Date.now(),
            },
          ],
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
          state.events.push({
            id: createId('evt_cancel'),
            kind: 'cancelled',
            agent: 'system',
            timestamp: Date.now(),
          })
          return
        }
        state.status = AGENT_STATUS.ERROR
        state.error = action.payload?.message || 'Agent run failed'
        state.events.push({
          id: createId('evt_err'),
          kind: 'error',
          agent: 'system',
          message: state.error,
          timestamp: Date.now(),
        })
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
  clearEvents,
  resetAgent,
} = agentSlice.actions

export default agentSlice.reducer
