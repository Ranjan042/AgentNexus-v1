import { AUTH_STATUS } from '../domain/authTypes'

export const selectAuthState = (state) => state.auth

export const selectCurrentUser = (state) => state.auth?.user || null

export const selectAuthToken = (state) => state.auth?.token || null

export const selectIsAuthenticated = (state) =>
  Boolean(state.auth?.user) && state.auth?.status === AUTH_STATUS.AUTHENTICATED

export const selectAuthLoading = (state) =>
  state.auth?.status === AUTH_STATUS.LOADING

export const selectAuthStatus = (state) => state.auth?.status || AUTH_STATUS.IDLE

export const selectAuthError = (state) => state.auth?.error || null

export const selectIsAuthModalOpen = (state) =>
  Boolean(state.auth?.isAuthModalOpen)
