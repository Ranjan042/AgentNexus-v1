import { Check, LoaderCircle, X, ChevronRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { AGENT_ORDER } from '../domain/agentTypes'
import { selectAgent } from '../application/agentSelectors'
import { getAgentMeta } from './agentConfig'

export default function AgentProgress({ selectedAgent, onSelectAgent }) {
  const agent = useSelector(selectAgent)
  const seen = new Set(agent.progress.map((item) => item.agent))

  // Count events or tool calls per agent
  const agentStats = (agent.events || []).reduce((acc, ev) => {
    const role = ev.agent?.toLowerCase()
    if (role) {
      acc[role] = (acc[role] || 0) + 1
    }
    return acc
  }, {})

  return (
    <div className="border-b border-[var(--border)] bg-[var(--panel)]/40 p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Orchestration Pipeline
        </div>
        {selectedAgent ? (
          <button
            type="button"
            className="text-[10px] text-[var(--primary)] hover:underline"
            onClick={() => onSelectAgent?.(null)}
          >
            Clear agent filter
          </button>
        ) : (
          <span className="text-[10px] text-[var(--muted)]">
            Click step to filter logs
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {AGENT_ORDER.map((name, index) => {
          const meta = getAgentMeta(name)
          const Icon = meta.Icon
          const current = agent.currentAgent === name
          const completed = seen.has(name) && !current
          const failed = agent.status === 'error' && current
          const isSelected = selectedAgent === name

          const state = failed
            ? 'failed'
            : current
              ? 'running'
              : completed || agent.status === 'completed'
                ? 'completed'
                : 'pending'

          const count = agentStats[name] || 0

          return (
            <div key={name} className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onSelectAgent?.(isSelected ? null : name)}
                className={`group flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs transition-all ${
                  isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/15 shadow-sm ring-1 ring-[var(--primary)]/50'
                    : state === 'running'
                      ? 'border-indigo-500/50 bg-indigo-950/30 shadow-[0_0_12px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30'
                      : state === 'completed'
                        ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50'
                        : state === 'failed'
                          ? 'border-rose-500/40 bg-rose-950/20'
                          : 'border-[var(--border)] bg-[var(--editor)]/60 text-[var(--muted)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md ${
                      state === 'running'
                        ? 'text-indigo-400'
                        : state === 'completed'
                          ? 'text-emerald-400'
                          : state === 'failed'
                            ? 'text-rose-400'
                            : 'text-[var(--muted)]'
                    }`}
                  >
                    <Icon size={12} />
                  </div>

                  {state === 'running' ? (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col text-left">
                  <span
                    className={`font-medium capitalize text-[11px] ${
                      isSelected
                        ? 'text-[var(--primary)] font-semibold'
                        : state === 'running'
                          ? 'text-indigo-300'
                          : state === 'completed'
                            ? 'text-emerald-300'
                            : state === 'failed'
                              ? 'text-rose-300'
                              : 'text-[var(--text)]'
                    }`}
                  >
                    {name}
                  </span>
                </div>

                <div className="flex items-center">
                  {state === 'completed' ? (
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check size={9} strokeWidth={3} />
                    </span>
                  ) : state === 'running' ? (
                    <LoaderCircle size={11} className="animate-spin text-indigo-400" />
                  ) : state === 'failed' ? (
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                      <X size={9} strokeWidth={3} />
                    </span>
                  ) : count > 0 ? (
                    <span className="rounded-full bg-[var(--glass)] px-1.5 text-[9px] text-[var(--muted)]">
                      {count}
                    </span>
                  ) : null}
                </div>
              </button>

              {index < AGENT_ORDER.length - 1 ? (
                <ChevronRight size={12} className="text-[var(--muted)]/40 shrink-0" />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
