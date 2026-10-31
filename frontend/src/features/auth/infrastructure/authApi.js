import { gatewayClient, unwrap } from '../../../shared/api/httpClient'
import { AUTH_STORAGE_KEYS } from '../domain/authTypes'

export const getGoogleAuthUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  return `${baseUrl}/auth/google`
}

export const getSavedToken = () => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
  } catch {
    return null
  }
}

export const setSavedToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token)
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
    }
  } catch {
    // LocalStorage might be disabled
  }
}

export const clearSavedToken = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
  } catch {
    // Ignore storage errors
  }
}

export const getSavedUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setSavedUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
    }
  } catch {
    // Ignore storage errors
  }
}

export async function fetchCurrentUser(token) {
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {}
  return unwrap(gatewayClient.get('/auth/me', config))
}

export async function checkAuthStatus() {
  return unwrap(gatewayClient.get('/auth/status'))
}

export async function logoutApi() {
  return unwrap(gatewayClient.post('/auth/logout'))
}

export async function createPreviewTicket(sandboxId) {
  return unwrap(gatewayClient.post('/auth/preview-ticket', { sandboxId }))
}
