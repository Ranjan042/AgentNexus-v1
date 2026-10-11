import { useDispatch, useSelector } from 'react-redux'
import Terminal from './Terminal'
import EmptyState from '../../../shared/components/EmptyState'
import StatusBadge from '../../../shared/components/StatusBadge'
import { connectTerminal } from '../application/terminalActions'
import { selectShellStatus, selectTerminalConnected } from '../application/terminalSelectors'
import { selectSandboxId } from '../../sandbox/application/sandboxSelectors'

const STATUS_LABELS = {
  connecting: 'Connecting...',
  connected: 'Connected',
  disconnected: 'Disconnected',
  reconnecting: 'Reconnecting...',
  error: 'Error',
}

export default function TerminalPanel() {
  const dispatch = useDispatch()
  const connected = useSelector(selectTerminalConnected)
  const status = useSelector(selectShellStatus)
  const sandboxId = useSelector(selectSandboxId)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-1 text-xs">
        <StatusBadge status={status} label={STATUS_LABELS[status] || status} />
        <button
          type="button"
          className="ghost-btn"
          onClick={() => dispatch(connectTerminal(sandboxId))}
        >
          Reconnect
        </button>
      </div>
      {sandboxId ? (
        <div className="min-h-0 flex-1">
          <Terminal />
        </div>
      ) : (
        <EmptyState
          title="Terminal disconnected"
          description="Start a sandbox to attach a PTY session."
          action={
            <button type="button" className="primary-btn" disabled>
              Reconnect
            </button>
          }
        />
      )}
      {!connected && sandboxId ? (
        <div className="px-3 py-1 text-xs text-[var(--muted)]">{STATUS_LABELS[status]}</div>
      ) : null}
    </div>
  )
}
