import { createAsyncThunk } from '@reduxjs/toolkit'
import * as fileApi from '../infrastructure/fileApi'
import { normalizeError } from '../../../shared/api/errorHandler'
import { flatFilesToTree } from '../../../shared/utils/fileTree'
import { pushToast } from '../../ui/domain/uiSlice'

function requireSandboxId(getState) {
  const sandboxId = getState().sandbox.sandboxId
  if (!sandboxId) {
    throw new Error('No sandbox is running')
  }
  return sandboxId
}

function toTreePayload(files) {
  const items = files || []
  return {
    items,
    tree: flatFilesToTree(items),
  }
}

export const listWorkspaceFiles = createAsyncThunk(
  'files/list',
  async (sandboxIdArg, { getState, rejectWithValue }) => {
    try {
      const sandboxId = sandboxIdArg || requireSandboxId(getState)
      const data = await fileApi.listFiles(sandboxId)
      return toTreePayload(data.files || [])
    } catch (error) {
      const normalized = normalizeError(error, 'Failed to load files')
      return rejectWithValue(normalized)
    }
  },
)

export const deleteWorkspaceFiles = createAsyncThunk(
  'files/delete',
  async (files, { getState, dispatch, rejectWithValue }) => {
    try {
      const sandboxId = requireSandboxId(getState)
      const deleted = Array.isArray(files) ? files : [files]
      await fileApi.deleteFiles(sandboxId, deleted)
      const data = await fileApi.listFiles(sandboxId)
      dispatch(pushToast({ type: 'success', message: 'File deleted' }))
      return {
        ...toTreePayload(data.files || []),
        deleted,
      }
    } catch (error) {
      const normalized = normalizeError(error, 'Failed to delete file')
      dispatch(pushToast({ type: 'error', message: normalized.message }))
      return rejectWithValue(normalized)
    }
  },
)

export const moveWorkspaceFiles = createAsyncThunk(
  'files/move',
  async (moves, { getState, dispatch, rejectWithValue }) => {
    try {
      const sandboxId = requireSandboxId(getState)
      const files = Array.isArray(moves) ? moves : [moves]
      await fileApi.moveFiles(sandboxId, files)
      const data = await fileApi.listFiles(sandboxId)
      dispatch(pushToast({ type: 'success', message: 'File moved' }))
      return {
        ...toTreePayload(data.files || []),
        moves: files,
        selectedFile: files[0]?.to || null,
      }
    } catch (error) {
      const normalized = normalizeError(error, 'Failed to move file')
      dispatch(pushToast({ type: 'error', message: normalized.message }))
      return rejectWithValue(normalized)
    }
  },
)

export const searchWorkspaceFiles = createAsyncThunk(
  'files/search',
  async ({ query, path }, { getState, rejectWithValue }) => {
    try {
      const sandboxId = requireSandboxId(getState)
      const data = await fileApi.searchFiles(sandboxId, query, path)
      return {
        files: data.files || [],
        matches: data.matches || [],
        query: data.query || query,
      }
    } catch (error) {
      return rejectWithValue(normalizeError(error, 'Search failed'))
    }
  },
)
