import { Check, Circle, LoaderCircle, X } from 'lucide-react'
import { useSelector } from 'react-redux'
import { AGENT_ORDER } from '../domain/agentTypes'
import { selectAgent } from '../application/agentSelectors'

function StepIcon({ state }) {
  if (state === 'completed') {
    return <Check size={14} className="text-[var(--success)]" />
  }
  if (state === 'running') {
    return <LoaderCircle size={14} className="animate-spin text-[var(--primary)]" />
  }
  if (state === 'failed') {
    return <X size={14} className="text-[var(--error)]" />
  }
  return <Circle size={14} className="text-[var(--muted)]" />
}

export default function AgentProgress() {
  const agent = useSelector(selectAgent)
  const seen = new Set(agent.progress.map((item) => item.agent))

  return (
    <div className="border-b border-[var(--border)] p-3">
      <div className="panel-header !border-0 !px-0">Agent progress</div>
      <div className="space-y-2">
        {AGENT_ORDER.map((name) => {
          const current = agent.currentAgent === name
          const completed = seen.has(name) && !current
          const failed = agent.status === 'error' && current
          const state = failed
            ? 'failed'
            : current
              ? 'running'
              : completed || agent.status === 'completed'
                ? 'completed'
                : 'pending'
          const latest = [...agent.progress].reverse().find((item) => item.agent === name)
          return (
            <div key={name} className="flex gap-2 text-xs">
              <StepIcon state={state} />
              <div>
                <div className="capitalize text-[var(--text)]">{name} agent</div>
                {latest?.task ? <div className="text-[var(--muted)]">{latest.task}</div> : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
