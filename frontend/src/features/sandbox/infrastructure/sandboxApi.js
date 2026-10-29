import { gatewayClient, unwrap } from '../../../shared/api/httpClient'

export async function startSandbox(data = {}) {
  return unwrap(gatewayClient.post('/sandbox/start', data))
}

export async function fetchMySandboxes() {
  return unwrap(gatewayClient.get('/sandbox/my-sandboxes'))
}

export async function getSandboxDetails(sandboxId) {
  return unwrap(gatewayClient.get(`/sandbox/${sandboxId}`))
}

export async function deleteSandbox(sandboxId) {
  return unwrap(gatewayClient.delete(`/sandbox/${sandboxId}`))
}
