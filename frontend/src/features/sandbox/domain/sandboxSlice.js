import { createSlice } from '@reduxjs/toolkit'
import { SANDBOX_STATUS } from './sandboxTypes'
import { loadRecentSandboxes, startSandbox } from '../application/sandboxThunks'

const initialState = {
  sandboxId: null,
  previewUrl: null,
  status: SANDBOX_STATUS.IDLE,
  error: null,
  recents: [],
}

const sandboxSlice = createSlice({
  name: 'sandbox',
  initialState,
  reducers: {
    hydrateSandbox(state, action) {
      const { sandboxId, previewUrl } = action.payload
      state.sandboxId = sandboxId
      state.previewUrl = previewUrl || state.previewUrl
      state.status = SANDBOX_STATUS.RUNNING
      state.error = null
    },
    setRecents(state, action) {
      state.recents = action.payload
    },
    clearSandboxError(state) {
      state.error = null
    },
    resetSandbox() {
      return { ...initialState, recents: [] }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startSandbox.pending, (state) => {
        state.status = SANDBOX_STATUS.STARTING
        state.error = null
      })
      .addCase(startSandbox.fulfilled, (state, action) => {
        state.status = SANDBOX_STATUS.RUNNING
        state.sandboxId = action.payload.sandboxId
        state.previewUrl = action.payload.previewUrl
        state.error = null
        if (action.payload.recents) {
          state.recents = action.payload.recents
        }
      })
      .addCase(startSandbox.rejected, (state, action) => {
        state.status = SANDBOX_STATUS.ERROR
        state.error = action.payload?.message || 'Failed to start sandbox'
      })
      .addCase(loadRecentSandboxes.fulfilled, (state, action) => {
        state.recents = action.payload
      })
  },
})

export const { hydrateSandbox, setRecents, clearSandboxError, resetSandbox } =
  sandboxSlice.actions

export default sandboxSlice.reducer
