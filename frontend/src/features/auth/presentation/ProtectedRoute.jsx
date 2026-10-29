import { useSelector } from 'react-redux'
import {
  selectIsAuthenticated,
  selectAuthLoading,
} from '../application/authSelectors'
import Spinner from '../../../shared/components/Spinner'
import GoogleSignInButton from './GoogleSignInButton'

/**
 * Route guard component protecting private views.
 */
export default function ProtectedRoute({ children, fallback = null }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loading = useSelector(selectAuthLoading)

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Spinner label="Verifying authorization..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallback) return fallback

    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
        <div className="island max-w-md p-8">
          <h2 className="text-xl font-medium mb-2">Authentication Required</h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            You must be signed in with your Google account to access this resource.
          </p>
          <GoogleSignInButton text="Sign in with Google" theme="dark" size="standard" />
        </div>
      </div>
    )
  }

  return children
}
