import { createSlice } from '@reduxjs/toolkit'
import { startSandbox } from '../../sandbox/application/sandboxThunks'

const initialState = {
  url: null,
  loading: false,
  revision: 0,
}

const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    setPreviewUrl(state, action) {
      state.url = action.payload
    },
    bumpPreview(state) {
      state.revision += 1
      state.loading = false
    },
    setPreviewLoading(state, action) {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startSandbox.fulfilled, (state, action) => {
        state.url = action.payload.previewUrl
        state.revision += 1
      })
  },
})

export const { setPreviewUrl, bumpPreview, setPreviewLoading } = previewSlice.actions
export default previewSlice.reducer
