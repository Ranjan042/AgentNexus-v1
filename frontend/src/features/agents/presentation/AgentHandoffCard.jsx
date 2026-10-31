import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { getAgentMeta, formatTimestamp } from './agentConfig'

export default function AgentHandoffCard({ event }) {
  const currentAgent = getAgentMeta(event.agent)
  const nextAgent = event.nextAgent ? getAgentMeta(event.nextAgent) : null
  const CurrentIcon = currentAgent.Icon
  const NextIcon = nextAgent?.Icon

  const actions = event.actions || []
  const priority = event.priority

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel-2)]/80 p-3 shadow-xs">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-lg border ${currentAgent.pillClass}`}
          >
            <CurrentIcon size={12} />
          </div>
          <span className="font-semibold text-[var(--text)]">
            {currentAgent.label}
          </span>

          {nextAgent ? (
            <>
              <ArrowRight size={12} className="text-[var(--muted)]" />
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-lg border ${nextAgent.pillClass}`}
              >
                <NextIcon size={12} />
              </div>
              <span className="font-semibold text-[var(--text)]">
                {nextAgent.label}
              </span>
            </>
          ) : null}

          {priority ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                priority === 'high'
                  ? 'bg-rose-500/20 text-rose-300'
                  : priority === 'medium'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-zinc-500/20 text-zinc-300'
              }`}
            >
              {priority} priority
            </span>
          ) : null}
        </div>

        <span className="text-[10px] text-[var(--muted)]">
          {formatTimestamp(event.timestamp)}
        </span>
      </div>

      {event.task ? (
        <div className="mt-2.5 rounded-lg border border-[var(--border)] bg-[var(--editor)] p-2 text-xs">
          <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--primary)]">
            <Sparkles size={11} />
            Assigned Objective
          </div>
          <div className="text-[var(--text)] leading-relaxed">{event.task}</div>
        </div>
      ) : null}

      {event.reasoning ? (
        <div className="mt-2 text-xs italic text-[var(--muted)] leading-relaxed">
          &ldquo;{event.reasoning}&rdquo;
        </div>
      ) : null}

      {actions.length > 0 ? (
        <div className="mt-2.5 space-y-1.5 border-t border-[var(--border)] pt-2 text-xs">
          <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
            Actions Executed
          </div>
          <div className="flex flex-wrap gap-1.5">
            {actions.map((act, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--editor)] px-2 py-0.5 text-[11px] font-mono text-[var(--text)]"
              >
                <CheckCircle2 size={11} className="text-emerald-400" />
                <span className="text-[var(--primary)] font-semibold">
                  {act.type}
                </span>
                {act.target ? (
                  <span className="text-[var(--muted)] truncate max-w-[180px]">
                    {act.target}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
