import { useDispatch, useSelector } from 'react-redux'
import { Play, Square, Sparkles, CornerDownLeft, Lock } from 'lucide-react'
import { cancelAgentRun, runAgent } from '../application/agentThunks'
import { setTask } from '../domain/agentSlice'
import { selectAgentStatus, selectAgentTask } from '../application/agentSelectors'
import { selectIsAuthenticated } from '../../auth/application/authSelectors'
import { openAuthModal } from '../../auth/domain/authSlice'

const PROMPT_SUGGESTIONS = [
  'Build Tic Tac Toe game with score tracker',
  'Add dark / light theme switcher',
  'Fix runtime errors and inspect console',
  'Create responsive navigation bar',
]

export default function AgentTaskInput() {
  const dispatch = useDispatch()
  const task = useSelector(selectAgentTask)
  const status = useSelector(selectAgentStatus)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const running = status === 'connecting' || status === 'running'

  const handleAction = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal())
      return
    }
    if (task.trim()) {
      dispatch(runAgent(task))
    }
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !running) {
      e.preventDefault()
      handleAction()
    }
  }

  return (
    <div className="border-b border-[var(--border)] bg-[var(--panel-2)]/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
          <Sparkles size={12} className="text-[var(--primary)]" />
          Task Prompt
        </label>
        <span className="text-[10px] text-[var(--muted)]">
          Press <kbd className="rounded border border-[var(--border)] bg-[var(--editor)] px-1 py-0.5 text-[9px]">Ctrl+Enter</kbd> to run
        </span>
      </div>

      <div className="relative">
        <textarea
          value={task}
          onChange={(event) => dispatch(setTask(event.target.value))}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Describe what you want the multi-agent team to build or modify..."
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--editor)] p-2.5 text-xs text-[var(--text)] outline-none transition-all placeholder:text-[var(--muted)]/70 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/50 leading-relaxed"
        />
      </div>

      {/* Suggestion Chips when empty and idle */}
      {!task.trim() && !running ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {PROMPT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              className="rounded-md border border-[var(--border)] bg-[var(--glass)] px-2 py-0.5 text-[10px] text-[var(--muted)] hover:border-[var(--primary)]/50 hover:text-[var(--text)] transition-colors text-left"
              onClick={() => dispatch(setTask(sug))}
            >
              + {sug}
            </button>
          ))}
        </div>
      ) : null}

      {/* Unauthenticated notice banner */}
      {!isAuthenticated && !running ? (
        <div className="mt-2 flex items-center justify-between rounded-xl border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-300">
          <span className="flex items-center gap-1.5">
            <Lock size={12} /> Sign in required to run AI agent
          </span>
          <button
            type="button"
            className="rounded bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-[#121216] transition hover:bg-amber-300 active:scale-95 cursor-pointer"
            onClick={() => dispatch(openAuthModal())}
          >
            Sign In
          </button>
        </div>
      ) : null}

      <div className="mt-2.5">
        {running ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 active:scale-[0.99]"
            onClick={() => cancelAgentRun()}
          >
            <Square size={13} fill="currentColor" />
            Stop Agent Execution
          </button>
        ) : !isAuthenticated ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/15 px-3 py-2 text-xs font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary)]/25 active:scale-[0.99] cursor-pointer"
            onClick={() => dispatch(openAuthModal())}
          >
            <Lock size={13} />
            <span>Sign in to Run Agent</span>
          </button>
        ) : (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-[#121216] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 cursor-pointer"
            disabled={!task.trim()}
            onClick={handleAction}
          >
            <Play size={13} fill="currentColor" />
            <span>Run Multi-Agent Team</span>
            <CornerDownLeft size={11} className="opacity-60" />
          </button>
        )}
      </div>
    </div>
  )
}
