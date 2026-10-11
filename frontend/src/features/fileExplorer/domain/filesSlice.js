import { createSlice } from '@reduxjs/toolkit'
import {
  deleteWorkspaceFiles,
  listWorkspaceFiles,
  moveWorkspaceFiles,
  searchWorkspaceFiles,
} from '../application/fileThunks'
import { collectFolderPaths } from '../../../shared/utils/fileTree'

const initialState = {
  items: [],
  tree: [],
  expandedFolders: [],
  selectedFile: null,
  loading: false,
  error: null,
  searchQuery: '',
  searchResults: {
    files: [],
    matches: [],
  },
  searchLoading: false,
  searchError: null,
}

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    toggleFolder(state, action) {
      const path = action.payload
      if (state.expandedFolders.includes(path)) {
        state.expandedFolders = state.expandedFolders.filter((item) => item !== path)
      } else {
        state.expandedFolders.push(path)
      }
    },
    expandFolders(state, action) {
      const next = new Set(state.expandedFolders)
      action.payload.forEach((path) => next.add(path))
      state.expandedFolders = [...next]
    },
    setSelectedFile(state, action) {
      state.selectedFile = action.payload
    },
    setFileSearchQuery(state, action) {
      state.searchQuery = action.payload
    },
    replaceFileTree(state, action) {
      state.items = action.payload.items
      state.tree = action.payload.tree
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listWorkspaceFiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(listWorkspaceFiles.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.tree = action.payload.tree
        if (state.expandedFolders.length === 0) {
          state.expandedFolders = collectFolderPaths(action.payload.tree).slice(0, 12)
        }
      })
      .addCase(listWorkspaceFiles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to load files'
      })
      .addCase(deleteWorkspaceFiles.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.tree = action.payload.tree
        if (action.payload.deleted.includes(state.selectedFile)) {
          state.selectedFile = null
        }
      })
      .addCase(moveWorkspaceFiles.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.tree = action.payload.tree
        if (action.payload.selectedFile) {
          state.selectedFile = action.payload.selectedFile
        }
      })
      .addCase(searchWorkspaceFiles.pending, (state) => {
        state.searchLoading = true
        state.searchError = null
      })
      .addCase(searchWorkspaceFiles.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload
      })
      .addCase(searchWorkspaceFiles.rejected, (state, action) => {
        state.searchLoading = false
        state.searchError = action.payload?.message || 'Search failed'
      })
  },
})

export const {
  toggleFolder,
  expandFolders,
  setSelectedFile,
  setFileSearchQuery,
  replaceFileTree,
} = filesSlice.actions

export default filesSlice.reducer
