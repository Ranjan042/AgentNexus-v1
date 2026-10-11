export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div>
        <div className="text-[var(--text)] mb-1">{title}</div>
        {description ? <div className="text-sm">{description}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  )
}
