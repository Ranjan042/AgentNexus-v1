import { createAsyncThunk } from '@reduxjs/toolkit'
import * as authApi from '../infrastructure/authApi'

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Check if token came from OAuth redirect in URL params
      const searchParams = new URLSearchParams(window.location.search)
      const queryToken = searchParams.get('token')
      const authStatus = searchParams.get('auth')

      let token = queryToken || authApi.getSavedToken()

      if (queryToken && authStatus === 'success') {
        authApi.setSavedToken(queryToken)
        // Clean URL without triggering full page reload
        searchParams.delete('token')
        searchParams.delete('auth')
        const newSearch = searchParams.toString()
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '')
        window.history.replaceState({}, document.title, newPath)
      }

      // 2. If token exists, verify with /auth/me
      if (token) {
        try {
          const res = await authApi.fetchCurrentUser(token)
          if (res?.user) {
            const activeToken = res.token || token
            authApi.setSavedUser(res.user)
            authApi.setSavedToken(activeToken)
            return { user: res.user, token: activeToken }
          }
        } catch {
          // Token invalid or verification failed; proceed to status check
        }
      }

      // 3. Fallback: check session cookie via /auth/status
      const statusRes = await authApi.checkAuthStatus()
      if (statusRes?.authenticated && statusRes?.user) {
        const resolvedToken = statusRes.token || token || authApi.getSavedToken()
        if (resolvedToken) {
          authApi.setSavedToken(resolvedToken)
        }
        authApi.setSavedUser(statusRes.user)
        return { user: statusRes.user, token: resolvedToken }
      }

      // Unauthenticated
      authApi.clearSavedToken()
      return { user: null, token: null }
    } catch (err) {
      authApi.clearSavedToken()
      return rejectWithValue(err.message || 'Failed to authenticate session')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      await authApi.logoutApi()
    } catch (err) {
      console.warn('Logout API warning:', err.message)
    } finally {
      authApi.clearSavedToken()
    }
    return true
  }
)

export const loginWithGoogle = () => {
  window.location.href = authApi.getGoogleAuthUrl()
}
