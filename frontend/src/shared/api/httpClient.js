import axios from 'axios'
import { API_BASE_URL, getSandboxAgentUrl } from './apiConfig'
import { normalizeError } from './errorHandler'
import { AUTH_STORAGE_KEYS } from '../../features/auth/domain/authTypes'

export const gatewayClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function createSandboxClient(sandboxId) {
  const client = axios.create({
    baseURL: `${getSandboxAgentUrl(sandboxId)}/api`,
    timeout: 60_000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'X-Sandbox-Id': sandboxId,
    },
  })
  attachInterceptors(client)
  return client
}

function attachInterceptors(client) {
  // Request interceptor: attach Bearer token if available
  client.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Storage access may be restricted
    }
    return config
  })

  // Response interceptor: normalize errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        try {
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
          localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
        } catch {
          // Ignore
        }
      }
      return Promise.reject(normalizeError(error))
    },
  )
}

attachInterceptors(gatewayClient)

export async function unwrap(promise) {
  try {
    const response = await promise
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}
