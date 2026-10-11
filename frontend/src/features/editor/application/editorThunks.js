import { createAsyncThunk } from '@reduxjs/toolkit'
import * as fileApi from '../../fileExplorer/infrastructure/fileApi'
import { normalizeError } from '../../../shared/api/errorHandler'
import { setSelectedFile } from '../../fileExplorer/domain/filesSlice'
import { pushToast } from '../../ui/domain/uiSlice'
import { refreshPreview } from '../../preview/application/previewThunks'

export const openWorkspaceFile = createAsyncThunk(
  'editor/openFile',
  async ({ path, line }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { sandbox, editor } = getState()
      if (!sandbox.sandboxId) {
        throw new Error('No sandbox is running')
      }

      dispatch(setSelectedFile(path))

      if (editor.fileContents[path] !== undefined) {
        return {
          path,
          content: editor.fileContents[path],
          line,
          cached: true,
        }
      }

      const data = await fileApi.readFiles(sandbox.sandboxId, [path])
      const file = data.files?.[0]
      if (file?.error) {
        throw new Error(file.error)
      }

      return {
        path,
        content: file?.content ?? '',
        line,
        cached: false,
      }
    } catch (error) {
      const normalized = normalizeError(error, `Failed to open ${path}`)
      dispatch(pushToast({ type: 'error', message: normalized.message }))
      return rejectWithValue(normalized)
    }
  },
)

export const saveActiveFile = createAsyncThunk(
  'editor/saveActive',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { sandbox, editor } = getState()
      const path = editor.activeTab
      if (!path) {
        throw new Error('No file is open')
      }
      if (!sandbox.sandboxId) {
        throw new Error('No sandbox is running')
      }

      const content = editor.fileContents[path] ?? ''
      await fileApi.updateFiles(sandbox.sandboxId, [{ path, content }])
      dispatch(pushToast({ type: 'success', message: 'File saved' }))
      dispatch(refreshPreview())
      return { path, content }
    } catch (error) {
      const normalized = normalizeError(error, 'Failed to save file')
      dispatch(pushToast({ type: 'error', message: normalized.message }))
      return rejectWithValue(normalized)
    }
  },
)

export const saveAllFiles = createAsyncThunk(
  'editor/saveAll',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { sandbox, editor } = getState()
      if (!sandbox.sandboxId) {
        throw new Error('No sandbox is running')
      }
      if (editor.dirtyFiles.length === 0) {
        return { paths: [] }
      }

      const updates = editor.dirtyFiles.map((path) => ({
        path,
        content: editor.fileContents[path] ?? '',
      }))
      await fileApi.updateFiles(sandbox.sandboxId, updates)
      dispatch(pushToast({ type: 'success', message: 'All files saved' }))
      dispatch(refreshPreview())
      return { paths: editor.dirtyFiles }
    } catch (error) {
      const normalized = normalizeError(error, 'Failed to save files')
      dispatch(pushToast({ type: 'error', message: normalized.message }))
      return rejectWithValue(normalized)
    }
  },
)

export const reloadOpenFiles = createAsyncThunk(
  'editor/reloadOpen',
  async (_, { getState }) => {
    const { sandbox, editor } = getState()
    if (!sandbox.sandboxId || editor.openTabs.length === 0) {
      return { files: [] }
    }

    const dirty = new Set(editor.dirtyFiles)
    const toReload = editor.openTabs.filter((path) => !dirty.has(path))
    if (toReload.length === 0) {
      return { files: [] }
    }

    const data = await fileApi.readFiles(sandbox.sandboxId, toReload)
    return { files: data.files || [] }
  },
)
