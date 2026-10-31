import { useState, useRef, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Search,
  X,
  Copy,
  CheckCheck,
  Trash2,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Terminal,
} from 'lucide-react'
import { selectAgentEvents, selectAgentStatus } from '../application/agentSelectors'
import { clearEvents } from '../domain/agentSlice'
import { pushToast } from '../../ui/domain/uiSlice'
import { formatTimestamp, formatDuration } from './agentConfig'

export default function AgentLogConsole() {
  const dispatch = useDispatch()
  const events = useSelector(selectAgentEvents)
  const status = useSelector(selectAgentStatus)

  const [filterLevel, setFilterLevel] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [copied, setCopied] = useState(false)

  const scrollRef = useRef(null)
  const sentinelRef = useRef(null)

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filterLevel === 'STEP' && e.kind !== 'progress') return false
      if (filterLevel === 'THOUGHT' && e.kind !== 'message') return false
      if (filterLevel === 'TOOL' && e.kind !== 'tool_call') return false
      if (filterLevel === 'ERROR' && e.kind !== 'error') return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const raw = `${e.kind} ${e.agent} ${e.content || ''} ${e.tool || ''} ${e.task || ''} ${e.message || ''} ${JSON.stringify(e.input || '')} ${JSON.stringify(e.output || '')}`.toLowerCase()
        return raw.includes(q)
      }

      return true
    })
  }, [events, filterLevel, searchQuery])

  useEffect(() => {
    if (autoScroll && sentinelRef.current) {
      sentinelRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [filtered.length, autoScroll])

  const handleCopy = () => {
    if (!events.length) return
    const text = events
      .map((e) => {
        const time = formatTimestamp(e.timestamp)
        const agent = (e.agent || 'SYSTEM').toUpperCase()
        if (e.kind === 'progress') return `[${time}] [STEP] [${agent}] -> ${e.nextAgent || 'finish'}: ${e.task || ''}`
        if (e.kind === 'message') return `[${time}] [THOUGHT] [${agent}]: ${e.content}`
        if (e.kind === 'tool_call') {
          return `[${time}] [TOOL] [${agent}] ${e.tool} (${e.status}) ${JSON.stringify(e.input)} => ${JSON.stringify(e.output)}`
        }
        if (e.kind === 'error') return `[${time}] [ERROR] [${agent}]: ${e.message || e.error}`
        if (e.kind === 'completed') return `[${time}] [COMPLETED] Finished in ${formatDuration(e.duration)}`
        return `[${time}] [${e.kind}]`
      })
      .join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      dispatch(pushToast({ type: 'success', message: 'Console logs copied!' }))
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isStreaming = status === 'running' || status === 'connecting'

  return (
    <div className="flex h-full flex-col bg-[#0d0e11] font-mono text-xs text-[var(--text)] select-text">
      {/* Console Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--panel-2)]/80 px-3 py-1.5 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          <span className="flex items-center gap-1 font-semibold text-[var(--muted)] mr-2">
            <Terminal size={12} className="text-[var(--primary)]" />
            CONSOLE
          </span>

          {['ALL', 'STEP', 'THOUGHT', 'TOOL', 'ERROR'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                filterLevel === lvl
                  ? 'bg-[var(--primary)] text-[#121216] font-bold'
                  : 'bg-[var(--glass)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
              onClick={() => setFilterLevel(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Search box */}
          <div className="relative">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter..."
              className="h-6 w-32 rounded border border-[var(--border)] bg-[var(--editor)] pl-6 pr-5 text-[11px] text-[var(--text)] outline-none focus:w-44 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
                onClick={() => setSearchQuery('')}
              >
                <X size={10} />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            className={`p-1 rounded transition-colors ${
              autoScroll ? 'text-indigo-400 bg-indigo-500/15' : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Auto-scroll lock is ON' : 'Auto-scroll lock is OFF'}
          >
            {autoScroll ? <Lock size={12} /> : <Unlock size={12} />}
          </button>

          <button
            type="button"
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--glass)]"
            onClick={handleCopy}
            title="Copy logs"
          >
            {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>

          <button
            type="button"
            className="p-1 rounded text-[var(--muted)] hover:text-rose-400 hover:bg-rose-500/15"
            onClick={() => dispatch(clearEvents())}
            title="Clear console"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Console Feed */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-2.5 space-y-1">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-[var(--muted)] text-[11px]">
            {events.length === 0
              ? 'No agent SSE events received yet. Start an agent to stream live work logs.'
              : 'No log lines match current console filter.'}
          </div>
        ) : (
          filtered.map((event) => {
            const time = formatTimestamp(event.timestamp)
            const agent = (event.agent || 'SYSTEM').toUpperCase()
            const isExpanded = expandedIds.has(event.id)

            if (event.kind === 'progress') {
              return (
                <div key={event.id} className="leading-5 py-0.5 border-l-2 border-indigo-500/50 pl-2">
                  <span className="text-[var(--muted)] select-none">[{time}] </span>
                  <span className="text-indigo-400 font-semibold">[STEP] </span>
                  <span className="text-indigo-300 font-bold">[{agent}] </span>
                  <span className="text-[var(--text)]">
                    Delegating to <span className="text-sky-300 font-semibold">{event.nextAgent || 'finish'}</span>
                    {event.task ? `: "${event.task}"` : ''}
                  </span>
                  {event.reasoning ? (
                    <div className="text-[11px] text-[var(--muted)] italic pl-4">
                      ↳ {event.reasoning}
                    </div>
                  ) : null}
                </div>
              )
            }

            if (event.kind === 'message') {
              return (
                <div key={event.id} className="leading-5 py-0.5 border-l-2 border-sky-500/40 pl-2">
                  <span className="text-[var(--muted)] select-none">[{time}] </span>
                  <span className="text-sky-400 font-semibold">[THOUGHT] </span>
                  <span className="text-sky-300 font-bold">[{agent}] </span>
                  <span className="text-[var(--text)] whitespace-pre-wrap">{event.content}</span>
                </div>
              )
            }

            if (event.kind === 'tool_call') {
              const isDone = event.status === 'completed'
              const isFail = event.status === 'failed' || event.status === 'error'

              return (
                <div
                  key={event.id}
                  className={`leading-5 py-0.5 border-l-2 pl-2 ${
                    isFail
                      ? 'border-rose-500 bg-rose-950/20'
                      : isDone
                        ? 'border-emerald-500/50'
                        : 'border-amber-500/60 bg-amber-950/10'
                  }`}
                >
                  <div
                    className="flex items-center gap-1.5 cursor-pointer hover:bg-[var(--glass)] rounded px-1 -mx-1"
                    onClick={() => toggleExpand(event.id)}
                  >
                    <span className="text-[var(--muted)]">
                      {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                    </span>
                    <span className="text-[var(--muted)] select-none">[{time}] </span>
                    <span className="text-amber-400 font-semibold">[TOOL] </span>
                    <span className="text-zinc-300 font-bold">[{agent}] </span>
                    <span className="font-semibold text-[var(--primary)]">{event.tool}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-1 rounded ${
                        isDone
                          ? 'text-emerald-400'
                          : isFail
                            ? 'text-rose-400'
                            : 'text-amber-300 animate-pulse'
                      }`}
                    >
                      ({event.status})
                    </span>
                    {event.completedAt && event.timestamp ? (
                      <span className="text-[10px] text-[var(--muted)]">
                        in {formatDuration(event.completedAt - event.timestamp)}
                      </span>
                    ) : null}
                  </div>

                  {isExpanded ? (
                    <div className="my-1 ml-4 rounded border border-[var(--border)] bg-[var(--editor)] p-2 text-[11px]">
                      <div className="font-bold text-[var(--muted)] mb-1">INPUT:</div>
                      <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-all text-[var(--text)]">
                        {JSON.stringify(event.input, null, 2)}
                      </pre>
                      <div className="font-bold text-[var(--muted)] mt-2 mb-1">OUTPUT:</div>
                      <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-all text-[var(--text)]">
                        {typeof event.output === 'object'
                          ? JSON.stringify(event.output, null, 2)
                          : String(event.output || 'No output recorded')}
                      </pre>
                    </div>
                  ) : null}
                </div>
              )
            }

            if (event.kind === 'error') {
              return (
                <div key={event.id} className="leading-5 py-0.5 border-l-2 border-rose-500 bg-rose-950/20 pl-2">
                  <span className="text-[var(--muted)] select-none">[{time}] </span>
                  <span className="text-rose-400 font-bold">[ERROR] </span>
                  <span className="text-rose-300 font-bold">[{agent}] </span>
                  <span className="text-rose-200">{event.message || event.error}</span>
                </div>
              )
            }

            if (event.kind === 'completed') {
              return (
                <div key={event.id} className="leading-5 py-1 border-l-2 border-emerald-400 bg-emerald-950/20 pl-2 font-bold text-emerald-300">
                  <span className="text-[var(--muted)] select-none">[{time}] </span>
                  <span>[COMPLETED] Pipeline finished</span>
                  {event.duration ? <span> in {formatDuration(event.duration)}</span> : null}
                </div>
              )
            }

            return null
          })
        )}

        {isStreaming ? (
          <div className="flex items-center gap-2 py-1 text-indigo-400 text-[11px] animate-pulse">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span>Streaming live SSE events from orchestration server...</span>
          </div>
        ) : null}

        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  )
}
