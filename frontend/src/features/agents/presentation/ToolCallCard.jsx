import { useState } from 'react'
import { Wrench } from 'lucide-react'

export default function ToolCallCard({ call }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="agent-card">
      <button type="button" className="flex w-full items-center gap-2 text-left" onClick={() => setOpen(!open)}>
        <Wrench size={12} />
        <span className="flex-1">{call.tool}</span>
        <span className="text-[var(--muted)]">{call.status}</span>
      </button>
      {open ? (
        <pre className="mt-2 overflow-auto text-[11px] text-[var(--muted)]">
          {JSON.stringify({ input: call.input, output: call.output }, null, 2)}
        </pre>
      ) : null}
    </div>
  )
}
