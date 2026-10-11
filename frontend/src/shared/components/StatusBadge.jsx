const COLORS = {
  running: 'var(--success)',
  connected: 'var(--success)',
  completed: 'var(--success)',
  starting: 'var(--warning)',
  connecting: 'var(--warning)',
  reconnecting: 'var(--warning)',
  live: 'var(--error)',
  error: 'var(--error)',
  idle: 'var(--muted)',
  disconnected: 'var(--muted)',
  cancelled: 'var(--muted)',
}

export default function StatusBadge({ status, label }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
      <span className="status-dot" style={{ background: COLORS[status] || 'var(--muted)' }} />
      {label || status}
    </span>
  )
}
