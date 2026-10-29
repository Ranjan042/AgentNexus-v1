import { createAsyncThunk } from '@reduxjs/toolkit'
import * as sandboxApi from '../infrastructure/sandboxApi'
import { normalizeError } from '../../../shared/api/errorHandler'
import { STORAGE_KEYS } from '../../../shared/constants/storage'
import { getSandboxPreviewUrl } from '../../../shared/api/apiConfig'
import { listWorkspaceFiles } from '../../fileExplorer/application/fileThunks'
import { pushToast } from '../../ui/domain/uiSlice'
import { connectTerminal } from '../../terminal/application/terminalActions'
import { openAuthModal } from '../../auth/domain/authSlice'

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

export const loadRecentSandboxes = createAsyncThunk(
  'sandbox/loadRecents',
  async (_, { getState }) => {
    const state = getState()
    const isAuthenticated = Boolean(state.auth?.user)

    if (isAuthenticated) {
      try {
        const res = await sandboxApi.fetchMySandboxes()
        if (res?.sandboxes && Array.isArray(res.sandboxes)) {
          return res.sandboxes.map((item) => ({
            sandboxId: item.sandboxId,
            name: item.name || `Sandbox ${item.sandboxId.slice(0, 8)}`,
            previewUrl: item.previewUrl,
            status: item.status,
            createdAt: item.createdAt,
            startedAt: new Date(item.createdAt).getTime(),
          }))
        }
      } catch (err) {
        console.warn('Failed to fetch user sandboxes from API, falling back to local cache:', err.message)
      }
    }

    return loadRecents()
  }
)

export const startSandbox = createAsyncThunk(
  'sandbox/start',
  async (_, { dispatch, getState, rejectWithValue }) => {
    // Prevent unauthenticated sandbox creation
    const state = getState()
    const isAuthenticated = Boolean(state.auth?.user)

    if (!isAuthenticated) {
      dispatch(openAuthModal())
      const message = 'Please sign in with Google to create a development sandbox.'
      dispatch(pushToast({ type: 'warning', message }))
      return rejectWithValue({ message })
    }

    try {
      const data = await sandboxApi.startSandbox()
      const sandboxId = data.sandboxId
      const previewUrl = data.previewUrl || getSandboxPreviewUrl(sandboxId)

      const recents = persistRecent({
        sandboxId,
        previewUrl,
        startedAt: Date.now(),
      })

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
      const normalized = normalizeError(error, 'Failed to start sandbox')
      if (error?.response?.status === 401) {
        dispatch(openAuthModal())
      }
      dispatch(pushToast({ type: 'error', message: normalized.message }))
      return rejectWithValue(normalized)
    }
  },
)

export const terminateSandbox = createAsyncThunk(
  'sandbox/terminate',
  async (sandboxId, { dispatch, rejectWithValue }) => {
    try {
      await sandboxApi.deleteSandbox(sandboxId)
      dispatch(pushToast({ type: 'success', message: `Sandbox ${sandboxId.slice(0, 8)} terminated` }))
      dispatch(loadRecentSandboxes())
      return sandboxId
    } catch (error) {
      const normalized = normalizeError(error, 'Failed to terminate sandbox')
      dispatch(pushToast({ type: 'error', message: normalized.message }))
      return rejectWithValue(normalized)
    }
  }
)
