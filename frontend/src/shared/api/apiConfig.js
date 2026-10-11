
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api'

export const getSandboxAgentUrl = (sandboxId) => {
  if (!sandboxId) {
    throw new Error('Sandbox ID is required')
  }

  return `/sandbox-host/${sandboxId}`
}

export const getSandboxPreviewUrl = (sandboxId) => {
  if (!sandboxId) return null

  const template =
    import.meta.env.VITE_SANDBOX_PREVIEW_URL ||
    'http://sandbox-{id}.preview.localhost'

  return template.replace('{id}', sandboxId)
}

export const getTerminalSocketUrl = (sandboxId) => {
  return `${getSandboxAgentUrl(sandboxId)}/api/terminal`
}
