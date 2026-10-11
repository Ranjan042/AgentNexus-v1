import { createAsyncThunk } from '@reduxjs/toolkit'
import { bumpPreview, setPreviewLoading } from '../domain/previewSlice'

export const refreshPreview = createAsyncThunk('preview/refresh', async (_, { dispatch }) => {
  dispatch(setPreviewLoading(true))
  dispatch(bumpPreview())
  return Date.now()
})
