export const selectPreviewState = (state) => state.preview

export const selectLivePreviewUrl = (state) => {
  const url = state.preview.url || state.sandbox.previewUrl
  if (!url) {
    return null
  }
  const join = url.includes('?') ? '&' : '?'
  const token = state.auth?.token
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : ''
  return `${url}${join}rev=${state.preview.revision}${tokenParam}`
}
