export const selectPreviewState = (state) => state.preview

export const selectPreviewBaseUrl = (state) => {
  const url = state.preview.url || state.sandbox.previewUrl
  if (!url) {
    return null
  }
  return url.replace(/\/+$/, '')
}

export const selectLivePreviewUrl = (state) => {
  const baseUrl = selectPreviewBaseUrl(state)
  if (!baseUrl) {
    return null
  }
  return `${baseUrl}/`
}
