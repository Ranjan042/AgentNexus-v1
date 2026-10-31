import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Sparkles,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Radio,
} from 'lucide-react'
import EmptyState from '../../../shared/components/EmptyState'
import AgentTaskInput from './AgentTaskInput'
import AgentProgress from './AgentProgress'
import AgentEvents from './AgentEvents'
import { selectAgent } from '../application/agentSelectors'
import { clearEvents } from '../domain/agentSlice'
import { formatDuration } from './agentConfig'

export default function AgentPanel() {
  const dispatch = useDispatch()
  const agent = useSelector(selectAgent)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showPipeline, setShowPipeline] = useState(true)
  const [now, setNow] = useState(Date.now)

  const isLive = agent.status === 'running' || agent.status === 'connecting'
  const isCompleted = agent.status === 'completed'
  const hasEvents = (agent.events && agent.events.length > 0) || agent.progress.length > 0

  // Live stopwatch while agent is executing
  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 500)
    return () => clearInterval(interval)
  }, [isLive])

  const elapsedMs = isLive && agent.startedAt
    ? Math.max(0, now - agent.startedAt)
    : isCompleted && agent.startedAt && agent.completedAt
      ? agent.completedAt - agent.startedAt
      : 0

  return (
    <aside className="panel h-full flex flex-col overflow-hidden bg-[var(--panel)]">
      {/* Header with Live SSE Indicator and Stopwatch */}
      <div className="panel-header shrink-0 flex items-center justify-between border-b border-[var(--border)] px-3 py-2 bg-[var(--panel-2)]">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
            <Sparkles size={13} />
          </div>
          <span className="font-semibold text-xs text-[var(--text)] tracking-normal">
            Agent Orchestrator
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Live / Status Pill */}
          {isLive ? (
            <div className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span>LIVE SSE</span>
              {elapsedMs > 0 ? (
                <span className="font-mono text-[9px] opacity-80 border-l border-rose-500/30 pl-1 ml-0.5">
                  {formatDuration(elapsedMs)}
                </span>
              ) : null}
            </div>
          ) : isCompleted ? (
            <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              <Clock size={10} />
              <span>Finished in {formatDuration(elapsedMs || (agent.completedAt - agent.startedAt))}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-[var(--glass)] px-2 py-0.5 text-[10px] text-[var(--muted)] capitalize">
              <Radio size={9} />
              <span>{agent.status}</span>
            </div>
          )}

          {/* Toggle Pipeline Visibility */}
          {hasEvents ? (
            <button
              type="button"
              className="rounded p-1 text-[var(--muted)] hover:bg-[var(--glass)] hover:text-[var(--text)] transition-colors"
              onClick={() => setShowPipeline(!showPipeline)}
              title={showPipeline ? 'Collapse pipeline' : 'Expand pipeline'}
            >
              {showPipeline ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : null}

          {/* Clear Logs */}
          {hasEvents && !isLive ? (
            <button
              type="button"
              className="rounded p-1 text-[var(--muted)] hover:bg-rose-500/15 hover:text-rose-400 transition-colors"
              onClick={() => dispatch(clearEvents())}
              title="Reset agent session"
            >
              <Trash2 size={13} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Task Input Area */}
      <AgentTaskInput />

      {/* Pipeline & Log Events Stream */}
      {!hasEvents && agent.status === 'idle' ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="Multi-Agent Team Ready"
            description="Supervisor, Research, Code, Debug, and Review agents are on standby. Enter a prompt above to start real-time SSE execution."
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {showPipeline ? (
            <AgentProgress
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
            />
          ) : null}

          <AgentEvents
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
          />
        </div>
      )}
    </aside>
  )
}
