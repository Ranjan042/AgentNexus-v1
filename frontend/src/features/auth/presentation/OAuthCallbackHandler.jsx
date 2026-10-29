import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { initializeAuth } from '../application/authThunks'
import Spinner from '../../../shared/components/Spinner'

/**
 * Handles OAuth callback redirects, parses query parameters, initializes session,
 * and navigates back to landing or previous location.
 */
export default function OAuthCallbackHandler() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    async function processAuth() {
      const error = searchParams.get('error')
      if (error) {
        navigate(`/?error=${encodeURIComponent(error)}`, { replace: true })
        return
      }

      await dispatch(initializeAuth())
      navigate('/', { replace: true })
    }

    processAuth()
  }, [dispatch, navigate, searchParams])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[var(--canvas)]">
      <div className="island p-8 text-center flex flex-col items-center gap-4">
        <Spinner label="Authenticating with Google..." />
        <p className="text-xs text-[var(--muted)]">Finalizing your secure session...</p>
      </div>
    </div>
  )
}
