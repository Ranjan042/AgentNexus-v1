import { useDispatch, useSelector } from 'react-redux'
import { X, Hexagon, ShieldCheck } from 'lucide-react'
import GoogleSignInButton from './GoogleSignInButton'
import {
  selectIsAuthModalOpen,
  selectAuthError,
} from '../application/authSelectors'
import { closeAuthModal, clearAuthError } from '../domain/authSlice'

/**
 * Authentication Modal following Google Material Design 3 dialog patterns.
 */
export default function AuthModal() {
  const dispatch = useDispatch()
  const isOpen = useSelector(selectIsAuthModalOpen)
  const authError = useSelector(selectAuthError)

  if (!isOpen) return null

  const handleClose = () => {
    dispatch(clearAuthError())
    dispatch(closeAuthModal())
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="modal max-w-sm rounded-2xl bg-[var(--panel)] border border-[var(--border)] p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] p-1 rounded-full hover:bg-[var(--glass)] transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4 border border-[var(--primary)]/20">
            <Hexagon size={24} />
          </div>

          <h2 id="auth-modal-title" className="text-xl font-semibold mb-1 text-[var(--text)]">
            Welcome to AgentNexus
          </h2>
          <p className="text-xs text-[var(--muted)] mb-6 max-w-xs">
            Sign in with your Google account to sync your sandbox workspaces, AI agent sessions, and terminal states.
          </p>

          <GoogleSignInButton
            text="Continue with Google"
            theme="dark"
            size="large"
            shape="pill"
            className="w-full justify-center shadow-md mb-4"
          />

          {authError && (
            <div className="w-full text-xs text-[var(--error)] bg-[var(--error)]/10 p-2.5 rounded-xl border border-[var(--error)]/20 mb-3 text-left">
              {authError}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] mt-2">
            <ShieldCheck size={13} className="text-[var(--success)]" />
            <span>Secure authentication powered by Google OAuth 2.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
