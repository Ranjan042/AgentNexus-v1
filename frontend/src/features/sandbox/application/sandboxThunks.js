import { createAsyncThunk } from '@reduxjs/toolkit'
import * as sandboxApi from '../infrastructure/sandboxApi'
import { normalizeError } from '../../../shared/api/errorHandler'
import { STORAGE_KEYS } from '../../../shared/constants/storage'
import { getSandboxPreviewUrl } from '../../../shared/api/apiConfig'
import { listWorkspaceFiles } from '../../fileExplorer/application/fileThunks'
import { pushToast } from '../../ui/domain/uiSlice'
import { connectTerminal } from '../../terminal/application/terminalActions'

function loadRecents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENTS)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistRecent(entry) {
  const recents = loadRecents().filter((item) => item.sandboxId !== entry.sandboxId)
  recents.unshift(entry)
  const next = recents.slice(0, 8)
  localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(next))
  return next
}

export const loadRecentSandboxes = createAsyncThunk('sandbox/loadRecents', async () => {
  return loadRecents()
})

export const startSandbox = createAsyncThunk(
  'sandbox/start',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await sandboxApi.startSandbox()
      console.log("data", data)
      const sandboxId = data.sandboxId
      const previewUrl = data.previewUrl || getSandboxPreviewUrl(sandboxId)

      const recents = persistRecent({
        sandboxId,
        previewUrl,
        startedAt: Date.now(),
      })

      console.log("recents",recents)
      dispatch(pushToast({ type: 'success', message: 'Sandbox started' }))
      dispatch(listWorkspaceFiles(sandboxId))
      dispatch(connectTerminal(sandboxId))

      return {
        sandboxId,
        previewUrl,
        message: data.message,
        recents,
      }
    } catch (error) {
      console.log("error",error)
      const normalized = normalizeError(error, 'Failed to start sandbox')
      dispatch(pushToast({ type: 'error', message: normalized.message }))
      return rejectWithValue(normalized)
    }
  },
)
