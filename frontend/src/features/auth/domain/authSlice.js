import { createSlice } from '@reduxjs/toolkit'
import { AUTH_STATUS } from './authTypes'
import { initializeAuth, logoutUser } from '../application/authThunks'
import { getSavedToken, getSavedUser } from '../infrastructure/authApi'

const initialSavedUser = getSavedUser()
const initialSavedToken = getSavedToken()

const initialState = {
  user: initialSavedUser,
  token: initialSavedToken,
  status: initialSavedUser ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.IDLE,
  error: null,
  isAuthModalOpen: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openAuthModal(state) {
      state.isAuthModalOpen = true
    },
    closeAuthModal(state) {
      state.isAuthModalOpen = false
    },
    clearAuthError(state) {
      state.error = null
    },
    setCredentials(state, action) {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.status = user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // initializeAuth
      .addCase(initializeAuth.pending, (state) => {
        if (!state.user) {
          state.status = AUTH_STATUS.LOADING
        }
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload.user) {
          state.user = action.payload.user
          state.token = action.payload.token || state.token
          state.status = AUTH_STATUS.AUTHENTICATED
          state.error = null
        } else {
          state.user = null
          state.token = null
          state.status = AUTH_STATUS.UNAUTHENTICATED
          state.error = null
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.user = null
        state.token = null
        state.status = AUTH_STATUS.UNAUTHENTICATED
        state.error = action.payload || 'Authentication failed'
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.status = AUTH_STATUS.UNAUTHENTICATED
        state.error = null
      })
  },
})

export const { openAuthModal, closeAuthModal, clearAuthError, setCredentials } =
  authSlice.actions

export default authSlice.reducer
