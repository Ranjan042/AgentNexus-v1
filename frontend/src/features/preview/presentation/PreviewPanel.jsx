import { useDispatch, useSelector } from 'react-redux'
import { ExternalLink, RefreshCw } from 'lucide-react'
import EmptyState from '../../../shared/components/EmptyState'
import Spinner from '../../../shared/components/Spinner'
import { refreshPreview } from '../application/previewThunks'
import { selectLivePreviewUrl, selectPreviewState } from '../application/previewSelectors'

export default function PreviewPanel({ variant = 'panel' }) {
  const dispatch = useDispatch()
  const url = useSelector(selectLivePreviewUrl)
  const preview = useSelector(selectPreviewState)

  return (
    <div className={variant === 'page' ? 'flex h-full flex-col bg-[var(--editor)]' : 'flex h-full min-h-0 flex-col'}>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-1">
        <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Preview</span>
        <div className="flex items-center gap-1">
          <button type="button" className="ghost-btn" onClick={() => dispatch(refreshPreview())}>
            <RefreshCw size={12} /> Refresh
          </button>
          {url ? (
            <a className="ghost-btn" href={preview.url} target="_blank" rel="noreferrer">
              <ExternalLink size={12} /> Open External
            </a>
          ) : null}
        </div>
      </div>
      {preview.loading ? (
        <div className="p-3">
          <Spinner label="Refreshing preview..." />
        </div>
      ) : null}
      {url ? (
        <iframe
          title="Sandbox preview"
          src={url}
          className="min-h-0 flex-1 border-0 bg-white"
        />
      ) : (
        <EmptyState title="No preview yet" description="Start a sandbox to load the running app." />
      )}
    </div>
  )
}
