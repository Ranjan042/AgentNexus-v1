import { Hexagon, Lock, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { loadRecentSandboxes, startSandbox } from '../features/sandbox/application/sandboxThunks'
import {
  selectRecentSandboxes,
  selectSandboxError,
  selectSandboxStatus,
} from '../features/sandbox/application/sandboxSelectors'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
} from '../features/auth/application/authSelectors'
import { openAuthModal } from '../features/auth/domain/authSlice'
import GoogleSignInButton from '../features/auth/presentation/GoogleSignInButton'
import UserProfileMenu from '../features/auth/presentation/UserProfileMenu'
import Spinner from '../shared/components/Spinner'

export default function LandingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const recents = useSelector(selectRecentSandboxes)
  const status = useSelector(selectSandboxStatus)
  const error = useSelector(selectSandboxError)

  const currentUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authLoading = useSelector(selectAuthLoading)

  const authUrlError = searchParams.get('error')

  useEffect(() => {
    dispatch(loadRecentSandboxes())
  }, [dispatch, isAuthenticated])

  const onStart = async () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal())
      return
    }

    const result = await dispatch(startSandbox())
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(`/workspace/${result.payload.sandboxId}`)
    }
  }

  return (
    <div className="landing relative min-h-screen flex flex-col justify-between">
      {/* Top Navigation Bar with Google Identity Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5 font-semibold text-base tracking-tight text-[var(--text)]">
          <Hexagon className="text-[var(--primary)]" size={24} />
          <span>AgentNexus</span>
        </div>

        <div className="flex items-center gap-3">
          {authLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-[var(--panel-2)]" />
          ) : isAuthenticated ? (
            <UserProfileMenu />
          ) : (
            <GoogleSignInButton
              text="Sign in with Google"
              theme="dark"
              size="small"
              shape="pill"
            />
          )}
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="landing-card relative overflow-hidden backdrop-blur-sm border border-[var(--border)]">
          {authUrlError && (
            <div className="mb-4 rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 p-3 text-xs text-[var(--error)]">
              Authentication note: {authUrlError === 'auth_failed' ? 'Google sign-in was cancelled or failed.' : authUrlError}
            </div>
          )}

          {isAuthenticated && currentUser ? (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-1 text-xs text-[var(--primary)]">
              <Sparkles size={12} />
              <span>Signed in as {currentUser.name}</span>
            </div>
          ) : (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-3 py-1 text-xs text-[var(--warning)]">
              <Lock size={12} />
              <span>Sign in required to launch sandboxes</span>
            </div>
          )}

          <h1 className="mb-2 text-2xl font-medium tracking-tight text-[var(--text)]">
            Create your development sandbox
          </h1>
          <p className="mb-6 text-sm text-[var(--muted)] leading-relaxed">
            Launch an isolated cloud workspace equipped with a live Monaco editor, xterm terminal, preview frame, and autonomous AI agents.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                className="primary-btn flex-1 py-2.5 justify-center text-center font-medium shadow-sm transition-all"
                onClick={onStart}
                disabled={status === 'starting'}
              >
                {status === 'starting' ? 'Creating sandbox...' : 'Start New Sandbox'}
              </button>
            ) : (
              <div className="flex-1 space-y-3">
                <button
                  type="button"
                  className="primary-btn w-full py-2.5 justify-center text-center font-medium shadow-sm transition-all flex items-center gap-2"
                  onClick={() => dispatch(openAuthModal())}
                >
                  <Lock size={15} />
                  <span>Sign In to Start Sandbox</span>
                </button>

                <div className="text-center">
                  <span className="text-xs text-[var(--muted)]">or</span>
                </div>

                <GoogleSignInButton
                  text="Sign in with Google"
                  theme="dark"
                  size="standard"
                  shape="pill"
                  className="w-full justify-center"
                />
              </div>
            )}
          </div>

          {status === 'starting' ? (
            <div className="mt-4">
              <Spinner label="Provisioning container and workspace..." />
            </div>
          ) : null}

          {error ? (
            <div className="mt-3 text-sm text-[var(--error)] bg-[var(--error)]/10 p-2.5 rounded-lg border border-[var(--error)]/20">
              {error}
            </div>
          ) : null}

          {recents && recents.length > 0 && (
            <div className="mt-8 border-t border-[var(--border)] pt-4">
              <div className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)] flex items-center justify-between">
                <span>{isAuthenticated ? 'Your Workspaces in Database' : 'Recent Workspaces'}</span>
                <span className="text-[11px] font-normal lowercase">{recents.length} active</span>
              </div>
              <div className="space-y-1.5">
                {recents.slice(0, 5).map((item) => (
                  <button
                    key={item.sandboxId}
                    type="button"
                    className="ghost-btn w-full justify-between text-xs font-mono py-1.5 px-2 rounded-lg hover:bg-[var(--glass)]"
                    onClick={() => navigate(`/workspace/${item.sandboxId}`)}
                  >
                    <span className="truncate max-w-[260px] text-left">
                      {item.name ? `${item.name} (${item.sandboxId.slice(0, 8)})` : item.sandboxId}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-sans">Open &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-[var(--muted)]">
        AgentNexus Cloud IDE &copy; {new Date().getFullYear()} &bull; Google OAuth 2.0 Protected
      </footer>
    </div>
  )
}
