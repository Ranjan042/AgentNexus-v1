import axios from 'axios'
import { API_BASE_URL, getSandboxAgentUrl } from './apiConfig'
import { normalizeError } from './errorHandler'

export const gatewayClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000,
  headers: {
    'Content-Type': 'application/json',
  },
})



export function createSandboxClient(sandboxId) {
  const client = axios.create({
    baseURL: `${getSandboxAgentUrl(sandboxId)}/api`,
    timeout: 60_000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  attachInterceptors(client)
  return client
}

function attachInterceptors(client) {
  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(normalizeError(error)),
  )
}

attachInterceptors(gatewayClient)

export async function unwrap(promise) {
  try {
    const response = await promise
    console.log('response', response) 
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}
