import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'
import EmptyState from '../../../shared/components/EmptyState'
import Spinner from '../../../shared/components/Spinner'
import { refreshPreview } from '../application/previewThunks'
import { selectLivePreviewUrl, selectPreviewState } from '../application/previewSelectors'
import { openPreviewInNewTab } from '../application/previewUtils'
import { getSavedToken } from '../../auth/infrastructure/authApi'
import { getSandboxPreviewUrl } from '../../../shared/api/apiConfig'

export default function PreviewPanel({ variant = 'panel' }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { sandboxId } = useParams()
  const url = useSelector(selectLivePreviewUrl)
  const preview = useSelector(selectPreviewState)
  const token = useSelector((state) => state.auth?.token) || getSavedToken()

  const handleOpenPreview = () => {
    if (!sandboxId) return
    const baseUrl = url || getSandboxPreviewUrl(sandboxId)
    openPreviewInNewTab(baseUrl, token)
  }

  return (
    <div className={variant === 'page' ? 'flex h-full flex-col bg-[var(--editor)]' : 'flex h-full min-h-0 flex-col'}>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-1">
        <div className="flex items-center gap-2">
          {variant === 'page' && sandboxId ? (
            <button
              type="button"
              className="ghost-btn text-xs"
              onClick={() => navigate(`/workspace/${sandboxId}`)}
            >
              <ArrowLeft size={12} /> Back to Editor
            </button>
          ) : null}
          <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="ghost-btn" onClick={() => dispatch(refreshPreview())}>
            <RefreshCw size={12} /> Refresh
          </button>
          {url ? (
            <button
              type="button"
              className="ghost-btn"
              onClick={handleOpenPreview}
              title="Open preview in new tab"
            >
              <ExternalLink size={12} /> Open in New Tab
            </button>
          ) : null}
        </div>
      </div>
      {preview.loading ? (
        <div className="p-3">
          <Spinner label="Refreshing preview..." />
        </div>
      ) : null}
      {url ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="island max-w-md p-6 flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-accent)] text-[var(--accent)]">
              <ExternalLink size={24} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">External Sandbox Preview</h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                The application preview runs in a dedicated Chrome tab with native developer tools.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenPreview}
              className="primary-btn flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink size={14} /> Open Preview in New Tab
            </button>
            <div className="text-[11px] text-[var(--muted)] truncate max-w-full font-mono bg-[var(--canvas)] px-2.5 py-1 rounded border border-[var(--border)]">
              {url}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState title="No preview yet" description="Start a sandbox to load the running app." />
      )}
    </div>
  )
}
