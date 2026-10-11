import { createSlice } from '@reduxjs/toolkit'
import { getLanguageFromFilename } from '../../../shared/utils/language'
import {
  openWorkspaceFile,
  reloadOpenFiles,
  saveActiveFile,
  saveAllFiles,
} from '../application/editorThunks'
import {
  deleteWorkspaceFiles,
  moveWorkspaceFiles,
} from '../../fileExplorer/application/fileThunks'

const initialState = {
  openTabs: [],
  activeTab: null,
  fileContents: {},
  dirtyFiles: [],
  saving: false,
  lastSavedAt: null,
  saveError: null,
  opening: false,
  cursorTarget: null,
}

function ensureTab(state, path) {
  if (!state.openTabs.includes(path)) {
    state.openTabs.push(path)
  }
}

function markDirty(state, path) {
  if (!state.dirtyFiles.includes(path)) {
    state.dirtyFiles.push(path)
  }
}

function clearDirty(state, path) {
  state.dirtyFiles = state.dirtyFiles.filter((item) => item !== path)
}

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload
      state.cursorTarget = null
    },
    closeTab(state, action) {
      const path = action.payload
      state.openTabs = state.openTabs.filter((item) => item !== path)
      state.dirtyFiles = state.dirtyFiles.filter((item) => item !== path)
      delete state.fileContents[path]
      if (state.activeTab === path) {
        state.activeTab = state.openTabs[state.openTabs.length - 1] || null
      }
    },
    updateFileContent(state, action) {
      const { path, content } = action.payload
      state.fileContents[path] = content
      markDirty(state, path)
    },
    hydrateFileContent(state, action) {
      const { path, content } = action.payload
      state.fileContents[path] = content
      clearDirty(state, path)
    },
    setCursorTarget(state, action) {
      state.cursorTarget = action.payload
    },
    clearSaveError(state) {
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(openWorkspaceFile.pending, (state) => {
        state.opening = true
      })
      .addCase(openWorkspaceFile.fulfilled, (state, action) => {
        const { path, content, line } = action.payload
        state.opening = false
        if (state.fileContents[path] === undefined || !state.dirtyFiles.includes(path)) {
          state.fileContents[path] = content
        }
        ensureTab(state, path)
        state.activeTab = path
        state.cursorTarget = line ? { path, line } : null
      })
      .addCase(openWorkspaceFile.rejected, (state) => {
        state.opening = false
      })
      .addCase(saveActiveFile.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(saveActiveFile.fulfilled, (state, action) => {
        state.saving = false
        state.lastSavedAt = Date.now()
        clearDirty(state, action.payload.path)
      })
      .addCase(saveActiveFile.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload?.message || 'Failed to save file'
      })
      .addCase(reloadOpenFiles.fulfilled, (state, action) => {
        action.payload?.files?.forEach((file) => {
          if (!file.error && !state.dirtyFiles.includes(file.file)) {
            state.fileContents[file.file] = file.content
          }
        })
      })
      .addCase(saveAllFiles.fulfilled, (state, action) => {
        action.payload.paths.forEach((path) => clearDirty(state, path))
        state.lastSavedAt = Date.now()
        state.saving = false
      })
      .addCase(deleteWorkspaceFiles.fulfilled, (state, action) => {
        action.payload.deleted.forEach((path) => {
          state.openTabs = state.openTabs.filter((item) => item !== path)
          state.dirtyFiles = state.dirtyFiles.filter((item) => item !== path)
          delete state.fileContents[path]
        })
        if (!state.openTabs.includes(state.activeTab)) {
          state.activeTab = state.openTabs[state.openTabs.length - 1] || null
        }
      })
      .addCase(moveWorkspaceFiles.fulfilled, (state, action) => {
        action.payload.moves.forEach(({ from, to }) => {
          if (state.fileContents[from] !== undefined) {
            state.fileContents[to] = state.fileContents[from]
            delete state.fileContents[from]
          }
          state.openTabs = state.openTabs.map((item) => (item === from ? to : item))
          state.dirtyFiles = state.dirtyFiles.map((item) => (item === from ? to : item))
          if (state.activeTab === from) {
            state.activeTab = to
          }
        })
      })
  },
})

export const {
  setActiveTab,
  closeTab,
  updateFileContent,
  hydrateFileContent,
  setCursorTarget,
  clearSaveError,
} = editorSlice.actions

export const selectLanguageForTab = (path) => getLanguageFromFilename(path)

export default editorSlice.reducer
