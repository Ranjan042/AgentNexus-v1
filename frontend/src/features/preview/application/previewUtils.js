/**
 * Opens sandbox preview in a new Chrome tab without exposing JWT tokens in the URL.
 * Uses HTTP POST form submission to /__session which sets an HttpOnly cookie
 * and 303-redirects to the clean root URL (http://sandbox-{id}.preview.localhost/).
 *
 * @param {string} previewUrl - Base preview URL (e.g. http://sandbox-{id}.preview.localhost)
 * @param {string} token - User authentication JWT token
 */
export function openPreviewInNewTab(previewUrl, token) {
  if (!previewUrl) return

  const cleanBase = previewUrl.replace(/\/+$/, '')
  const actionUrl = `${cleanBase}/__session`

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = actionUrl
  form.target = '_blank'
  form.style.display = 'none'

  if (token) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'token'
    input.value = token
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()

  setTimeout(() => {
    try {
      form.remove()
    } catch {
      // Ignore
    }
  }, 1000)
}
