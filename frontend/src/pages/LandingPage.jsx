import { Hexagon } from 'lucide-react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loadRecentSandboxes, startSandbox } from '../features/sandbox/application/sandboxThunks'
import { selectRecentSandboxes, selectSandboxError, selectSandboxStatus } from '../features/sandbox/application/sandboxSelectors'
import Spinner from '../shared/components/Spinner'

export default function LandingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const recents = useSelector(selectRecentSandboxes)
  const status = useSelector(selectSandboxStatus)
  const error = useSelector(selectSandboxError)

  useEffect(() => {
    dispatch(loadRecentSandboxes())
  }, [dispatch])

  const onStart = async () => {
    const result = await dispatch(startSandbox())
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(`/workspace/${result.payload.sandboxId}`)
    }
  }

  return (
    <div className="landing">
      <div className="landing-card">
        <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
          <Hexagon className="text-[var(--primary)]" size={22} />
          AgentNexus
        </div>
        <h1 className="mb-2 text-2xl font-medium">Create your development sandbox</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">
          Launch an isolated workspace with a live editor, terminal, preview, and AI coding agents.
        </p>
        <button type="button" className="primary-btn" onClick={onStart} disabled={status === 'starting'}>
          {status === 'starting' ? 'Creating sandbox...' : 'Start New Sandbox'}
        </button>
        {status === 'starting' ? (
          <div className="mt-4">
            <Spinner label="Loading workspace..." />
          </div>
        ) : null}
        {error ? <div className="mt-3 text-sm text-[var(--error)]">{error}</div> : null}
        {recents.length ? (
          <div className="mt-8">
            <div className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">Recent Workspaces</div>
            <div className="space-y-1">
              {recents.map((item) => (
                <button
                  key={item.sandboxId}
                  type="button"
                  className="ghost-btn w-full justify-start"
                  onClick={() => navigate(`/workspace/${item.sandboxId}`)}
                >
                  {item.sandboxId}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
