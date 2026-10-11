export function buildPreviewUrl(previewUrl, revision = 0) {
  if (!previewUrl) {
    return null
  }
  const join = previewUrl.includes('?') ? '&' : '?'
  return `${previewUrl}${join}rev=${revision}`
}
