import { createAsyncThunk } from '@reduxjs/toolkit'
import { runAgentSse } from '../infrastructure/agentSse'
import {
  normalizeCustom,
  normalizeMessages,
  normalizeProgress,
} from './normalizeAgentEvents'
import { normalizeError } from '../../../shared/api/errorHandler'
import { listWorkspaceFiles } from '../../fileExplorer/application/fileThunks'
import { reloadOpenFiles } from '../../editor/application/editorThunks'
import { refreshPreview } from '../../preview/application/previewThunks'
import { pushToast } from '../../ui/domain/uiSlice'
import {
  appendResult,
  applyMessages,
  applyProgress,
  markCompleted,
  setStreamError,
} from '../domain/agentSlice'

let abortController = null

export function cancelAgentRun() {
  abortController?.abort()
}

export const runAgent = createAsyncThunk(
  'agent/run',
  async (taskArg, { getState, dispatch, rejectWithValue }) => {
    const { sandbox, agent } = getState()
    const task = (taskArg || agent.task || '').trim()
    const sandboxId = sandbox.sandboxId

    if (!task) {
      return rejectWithValue({ success: false, message: 'Task is required' })
    }
    if (!sandboxId) {
      return rejectWithValue({ success: false, message: 'Sandbox ID is required' })
    }

    abortController?.abort()
    abortController = new AbortController()

    const handleEvent = ({ event, data }) => {
      if (event === 'agent_progress') {
        dispatch(applyProgress(normalizeProgress(data)))
      }
      if (event === 'agent_message') {
        dispatch(applyMessages(normalizeMessages(data)))
      }
      if (event === 'agent_custom') {
        dispatch(appendResult(normalizeCustom(data)))
      }
      if (event === 'agent_error') {
        dispatch(setStreamError(data?.message || data?.data || 'Agent error'))
      }
      if (event === 'agent_completed' || event === 'done') {
        dispatch(markCompleted())
      }
    }

    try {
      await runAgentSse({
        task,
        sandboxId,
        onEvent: handleEvent,
        signal: abortController.signal,
      })

      dispatch(listWorkspaceFiles(sandboxId))
      dispatch(reloadOpenFiles())
      dispatch(refreshPreview())
      dispatch(pushToast({ type: 'success', message: 'Agent completed' }))
      return { task, sandboxId }
    } catch (error) {
      if (error.name === 'AbortError') {
        return rejectWithValue({ success: false, message: 'cancelled' })
      }
      const normalized = normalizeError(error, 'Agent run failed')
      dispatch(pushToast({ type: 'error', message: normalized.message }))
      return rejectWithValue(normalized)
    }
  },
)
