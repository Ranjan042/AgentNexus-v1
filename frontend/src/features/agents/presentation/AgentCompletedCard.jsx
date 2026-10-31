import { CheckCircle2, Clock, Check, Sparkles } from 'lucide-react'
import { formatDuration, formatTimestamp } from './agentConfig'

export default function AgentCompletedCard({ event, stats }) {
  const duration = event.duration || stats?.duration

  return (
    <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 text-xs shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <span>Task Successfully Completed</span>
              <Sparkles size={12} className="text-emerald-400" />
            </div>
            <div className="text-[11px] text-emerald-300/70">
              All agent pipeline objectives were resolved
            </div>
          </div>
        </div>

        <span className="text-[10px] text-emerald-300/60">
          {formatTimestamp(event.timestamp)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-emerald-500/20 pt-2.5 text-[11px]">
        {duration ? (
          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-emerald-300">
            <Clock size={11} />
            <span>Finished in {formatDuration(duration)}</span>
          </div>
        ) : null}

        {stats?.toolCount ? (
          <div className="inline-flex items-center gap-1 rounded-md bg-[var(--glass)] px-2 py-1 text-[var(--text)]">
            <Check size={11} className="text-emerald-400" />
            <span>{stats.toolCount} tool {stats.toolCount === 1 ? 'call' : 'calls'} executed</span>
          </div>
        ) : null}

        {stats?.stepCount ? (
          <div className="inline-flex items-center gap-1 rounded-md bg-[var(--glass)] px-2 py-1 text-[var(--text)]">
            <span>{stats.stepCount} agent {stats.stepCount === 1 ? 'step' : 'steps'}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
