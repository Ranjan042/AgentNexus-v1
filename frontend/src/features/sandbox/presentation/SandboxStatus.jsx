import { useSelector } from 'react-redux'
import StatusBadge from '../../../shared/components/StatusBadge'
import { selectSandboxId, selectSandboxStatus } from '../application/sandboxSelectors'

export default function SandboxStatus() {
  const status = useSelector(selectSandboxStatus)
  const sandboxId = useSelector(selectSandboxId)
  const shortId = sandboxId ? `${sandboxId.slice(0, 8)}...` : '—'

  return (
    <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
      <span>Sandbox: {shortId}</span>
      <StatusBadge status={status === 'running' ? 'running' : status} label={status} />
    </div>
  )
}
