import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ShieldCheck, LogOut, ArrowLeft } from 'lucide-react'
import { selectUi } from '../features/ui/application/uiSelectors'
import { setFontSize, setMinimap, setWordWrap } from '../features/ui/domain/uiSlice'
import { selectSandboxId } from '../features/sandbox/application/sandboxSelectors'
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '../features/auth/application/authSelectors'
import { logoutUser } from '../features/auth/application/authThunks'
import GoogleSignInButton from '../features/auth/presentation/GoogleSignInButton'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const ui = useSelector(selectUi)
  const sandboxId = useSelector(selectSandboxId)
  const currentUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <div className="h-full overflow-auto bg-[var(--canvas)] p-8">
      <div className="island mx-auto max-w-xl p-6 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            to={sandboxId ? `/workspace/${sandboxId}` : '/'}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to workspace
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-medium tracking-tight text-[var(--text)]">Settings</h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Manage your workspace preferences and Google authentication.
          </p>
        </div>

        {/* Google Account Section */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)]/40 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
            Account & Identity
          </h2>

          {isAuthenticated && currentUser ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--primary)]/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-[#121216] font-bold text-lg flex items-center justify-center">
                    {(currentUser.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium text-sm text-[var(--text)]">{currentUser.name}</div>
                  <div className="text-xs text-[var(--muted)]">{currentUser.email}</div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-[var(--success)]">
                    <ShieldCheck size={12} />
                    <span>Google Account Connected</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dispatch(logoutUser())}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--error)] hover:bg-[var(--error)]/10 text-xs text-[var(--muted)] hover:text-[var(--error)] transition-colors"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--muted)]">
                  Sign in with Google to synchronize your workspaces and settings across devices.
                </p>
              </div>
              <GoogleSignInButton text="Sign in with Google" theme="dark" size="standard" />
            </div>
          )}
        </section>

        {/* Editor Preferences */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Editor Preferences
          </h2>

          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between py-1">
              <span className="text-[var(--text)]">Word wrap</span>
              <select
                value={ui.wordWrap}
                onChange={(event) => dispatch(setWordWrap(event.target.value))}
                className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs text-[var(--text)] outline-none"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </label>

            <label className="flex items-center justify-between py-1">
              <span className="text-[var(--text)]">Minimap</span>
              <input
                type="checkbox"
                checked={ui.minimap}
                onChange={(event) => dispatch(setMinimap(event.target.checked))}
                className="accent-[var(--primary)] h-4 w-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between py-1">
              <span className="text-[var(--text)]">Font size</span>
              <input
                type="number"
                min="11"
                max="22"
                value={ui.fontSize}
                onChange={(event) => dispatch(setFontSize(Number(event.target.value)))}
                className="w-20 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2 py-1 text-xs text-[var(--text)] outline-none"
              />
            </label>

            <div className="pt-2 text-xs text-[var(--muted)]">
              UI System: Google Material Design 3 / Antigravity Dark
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
