import { gatewayClient, unwrap } from '../../../shared/api/httpClient'

export async function startSandbox() {
  return unwrap(gatewayClient.post('/sandbox/start'))
}
