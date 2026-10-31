import { AlertTriangle, AlertCircle } from 'lucide-react'
import { formatTimestamp } from './agentConfig'

export default function AgentErrorCard({ event }) {
  const message = event.message || event.error || 'An unexpected error occurred during execution.'

  return (
    <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-3 text-xs shadow-xs">
      <div className="flex items-center justify-between text-rose-300">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <AlertTriangle size={14} />
          </div>
          <span className="font-semibold text-rose-200">Execution Error</span>
          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] uppercase font-bold text-rose-300">
            {event.agent || 'Agent'}
          </span>
        </div>
        <span className="text-[10px] text-rose-300/70">
          {formatTimestamp(event.timestamp)}
        </span>
      </div>

      <div className="mt-2.5 rounded-lg border border-rose-500/20 bg-[var(--editor)] p-2.5 font-mono text-[11px] text-rose-200 whitespace-pre-wrap break-all leading-relaxed">
        <div className="flex items-start gap-1.5">
          <AlertCircle size={13} className="shrink-0 mt-0.5 text-rose-400" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  )
}
