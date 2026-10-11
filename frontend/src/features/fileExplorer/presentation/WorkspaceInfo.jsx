import { useSelector } from 'react-redux'
import { selectSandbox } from '../../sandbox/application/sandboxSelectors'
import { selectFileItems } from '../application/fileSelectors'

export default function WorkspaceInfo() {
  const sandbox = useSelector(selectSandbox)
  const files = useSelector(selectFileItems)

  return (
    <div className="flex h-full flex-col">
      <div className="panel-header">Workspace</div>
      <div className="space-y-3 p-3 text-xs text-[var(--muted)]">
        <div>
          <div className="uppercase tracking-wide">Sandbox ID</div>
          <div className="mt-1 break-all text-[var(--text)]">{sandbox.sandboxId || '—'}</div>
        </div>
        <div>
          <div className="uppercase tracking-wide">Preview</div>
          <div className="mt-1 break-all text-[var(--text)]">{sandbox.previewUrl || '—'}</div>
        </div>
        <div>
          <div className="uppercase tracking-wide">Files</div>
          <div className="mt-1 text-[var(--text)]">{files.length}</div>
        </div>
      </div>
    </div>
  )
}
