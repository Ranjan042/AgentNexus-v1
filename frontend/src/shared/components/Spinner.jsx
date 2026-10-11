export default function Spinner({ label }) {
  return (
    <div className="flex items-center gap-2 text-[var(--muted)] text-sm">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--primary)]" />
      {label ? <span>{label}</span> : null}
    </div>
  )
}
