import { useState, useRef, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Search,
  X,
  ArrowDown,
  Copy,
  CheckCheck,
  Trash2,
  Lock,
  Unlock,
  Wrench,
  MessageSquare,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react'
import {
  selectAgentEvents,
  selectAgentStatus,
  selectAgentStartedAt,
  selectAgentCompletedAt,
} from '../application/agentSelectors'
import { clearEvents } from '../domain/agentSlice'
import { pushToast } from '../../ui/domain/uiSlice'
import ToolCallCard from './ToolCallCard'
import AgentHandoffCard from './AgentHandoffCard'
import AgentMessageCard from './AgentMessageCard'
import AgentErrorCard from './AgentErrorCard'
import AgentCompletedCard from './AgentCompletedCard'
import { formatTimestamp, formatDuration } from './agentConfig'

export default function AgentEvents({ selectedAgent, onSelectAgent }) {
  const dispatch = useDispatch()
  const events = useSelector(selectAgentEvents)
  const status = useSelector(selectAgentStatus)
  const startedAt = useSelector(selectAgentStartedAt)
  const completedAt = useSelector(selectAgentCompletedAt)

  const [filterType, setFilterType] = useState('all') // 'all' | 'thoughts' | 'tools' | 'files' | 'errors'
  const [searchQuery, setSearchQuery] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [userScrolledUp, setUserScrolledUp] = useState(false)
  const [unseenCount, setUnseenCount] = useState(0)
  const [copiedAll, setCopiedAll] = useState(false)

  const scrollRef = useRef(null)
  const sentinelRef = useRef(null)
  const prevEventsLength = useRef(events.length)

  // Calculate counts for filter pills
  const counts = useMemo(() => {
    let thoughts = 0
    let tools = 0
    let files = 0
    let errors = 0

    events.forEach((e) => {
      if (e.kind === 'message') thoughts++
      if (e.kind === 'tool_call') {
        tools++
        const name = (e.tool || '').toLowerCase()
        if (name.includes('file') || name.includes('read') || name.includes('write')) {
          files++
        }
      }
      if (e.kind === 'error') errors++
      if (e.actions?.length) files += e.actions.length
    })

    return { all: events.length, thoughts, tools, files, errors }
  }, [events])

  // Filter events based on active filters and search query
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Agent filter (e.g. from pipeline click)
      if (selectedAgent && e.agent?.toLowerCase() !== selectedAgent.toLowerCase()) {
        return false
      }

      // Filter by type
      if (filterType === 'thoughts' && e.kind !== 'message') return false
      if (filterType === 'tools' && e.kind !== 'tool_call') return false
      if (filterType === 'errors' && e.kind !== 'error') return false
      if (filterType === 'files') {
        const isFileTool =
          e.kind === 'tool_call' &&
          (e.tool?.toLowerCase().includes('file') ||
            e.tool?.toLowerCase().includes('write') ||
            e.tool?.toLowerCase().includes('read'))
        const hasActions = Boolean(e.actions?.length)
        if (!isFileTool && !hasActions) return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchKind = e.kind?.toLowerCase().includes(q)
        const matchAgent = e.agent?.toLowerCase().includes(q)
        const matchContent =
          typeof e.content === 'string' && e.content.toLowerCase().includes(q)
        const matchTask = e.task?.toLowerCase().includes(q)
        const matchTool = e.tool?.toLowerCase().includes(q)
        const matchInput =
          e.input && JSON.stringify(e.input).toLowerCase().includes(q)
        const matchOutput =
          e.output && JSON.stringify(e.output).toLowerCase().includes(q)
        const matchError = e.message?.toLowerCase().includes(q)

        return (
          matchKind ||
          matchAgent ||
          matchContent ||
          matchTask ||
          matchTool ||
          matchInput ||
          matchOutput ||
          matchError
        )
      }

      return true
    })
  }, [events, selectedAgent, filterType, searchQuery])

  // Handle scroll events to detect if user has scrolled away from the bottom
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    if (distanceFromBottom > 60) {
      setUserScrolledUp(true)
    } else {
      setUserScrolledUp(false)
      setUnseenCount(0)
    }
  }

  // Scroll to bottom helper
  const scrollToBottom = (smooth = true) => {
    if (sentinelRef.current) {
      sentinelRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      })
      setUserScrolledUp(false)
      setUnseenCount(0)
    }
  }

  // Auto-scroll when new events arrive
  useEffect(() => {
    const isNewEvent = events.length > prevEventsLength.current
    prevEventsLength.current = events.length

    if (isNewEvent) {
      if (autoScroll && !userScrolledUp) {
        scrollToBottom(true)
      } else if (userScrolledUp) {
        setUnseenCount((prev) => prev + (events.length - prevEventsLength.current || 1))
      }
    }
  }, [events.length, autoScroll, userScrolledUp])

  // Export / copy transcript
  const handleCopyTranscript = () => {
    if (!events.length) return

    const lines = [
      `# Agent Execution Log Transcript`,
      `Generated at: ${new Date().toLocaleString()}`,
      `Total Events: ${events.length}`,
      `----------------------------------------`,
    ]

    events.forEach((e) => {
      const time = formatTimestamp(e.timestamp)
      const agent = (e.agent || 'SYSTEM').toUpperCase()

      if (e.kind === 'progress') {
        lines.push(`\n[${time}] [HANDOFF] [${agent} -> ${e.nextAgent || 'finish'}]`)
        if (e.task) lines.push(`Task: ${e.task}`)
        if (e.reasoning) lines.push(`Reasoning: ${e.reasoning}`)
      } else if (e.kind === 'message') {
        lines.push(`\n[${time}] [THOUGHT] [${agent}]:\n${e.content}`)
      } else if (e.kind === 'tool_call') {
        lines.push(`\n[${time}] [TOOL] [${agent}] ${e.tool} (${e.status})`)
        if (e.input && Object.keys(e.input).length > 0) {
          lines.push(`Input: ${JSON.stringify(e.input, null, 2)}`)
        }
        if (e.output) {
          lines.push(
            `Output: ${typeof e.output === 'object' ? JSON.stringify(e.output, null, 2) : e.output}`
          )
        }
      } else if (e.kind === 'error') {
        lines.push(`\n[${time}] [ERROR] [${agent}]: ${e.message || e.error}`)
      } else if (e.kind === 'completed') {
        lines.push(`\n[${time}] [COMPLETED] Finished in ${formatDuration(e.duration)}`)
      }
    })

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedAll(true)
      dispatch(pushToast({ type: 'success', message: 'Agent log transcript copied!' }))
      setTimeout(() => setCopiedAll(false), 2000)
    })
  }

  const isStreaming = status === 'running' || status === 'connecting'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--panel)]">
      {/* Control Header & Filters */}
      <div className="shrink-0 border-b border-[var(--border)] bg-[var(--panel-2)]/60 p-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stream logs..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--editor)] py-1 pl-7 pr-7 text-xs text-[var(--text)] outline-none transition-colors placeholder:text-[var(--muted)]/70 focus:border-[var(--primary)]"
            />
            {searchQuery ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
                onClick={() => setSearchQuery('')}
              >
                <X size={12} />
              </button>
            ) : null}
          </div>

          {/* Quick Tool Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Auto-scroll toggle */}
            <button
              type="button"
              className={`rounded-lg p-1.5 transition-colors ${
                autoScroll
                  ? 'bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25'
                  : 'text-[var(--muted)] hover:bg-[var(--glass)] hover:text-[var(--text)]'
              }`}
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? 'Auto-scroll is ON' : 'Auto-scroll is OFF'}
            >
              {autoScroll ? <Lock size={13} /> : <Unlock size={13} />}
            </button>

            {/* Copy All Logs */}
            <button
              type="button"
              className="rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--glass)] hover:text-[var(--text)]"
              onClick={handleCopyTranscript}
              title="Copy entire log transcript"
            >
              {copiedAll ? (
                <CheckCheck size={13} className="text-[var(--success)]" />
              ) : (
                <Copy size={13} />
              )}
            </button>

            {/* Clear logs */}
            <button
              type="button"
              className="rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-rose-500/15 hover:text-rose-400"
              onClick={() => dispatch(clearEvents())}
              title="Clear event logs"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          <button
            type="button"
            className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-[var(--primary)] text-[#121216] font-semibold'
                : 'bg-[var(--glass)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
            onClick={() => setFilterType('all')}
          >
            All ({counts.all})
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition-colors ${
              filterType === 'thoughts'
                ? 'bg-indigo-500 text-white font-semibold'
                : 'bg-[var(--glass)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
            onClick={() => setFilterType('thoughts')}
          >
            <MessageSquare size={10} />
            Thoughts ({counts.thoughts})
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition-colors ${
              filterType === 'tools'
                ? 'bg-blue-500 text-white font-semibold'
                : 'bg-[var(--glass)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
            onClick={() => setFilterType('tools')}
          >
            <Wrench size={10} />
            Tools ({counts.tools})
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition-colors ${
              filterType === 'files'
                ? 'bg-emerald-500 text-white font-semibold'
                : 'bg-[var(--glass)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
            onClick={() => setFilterType('files')}
          >
            <FolderOpen size={10} />
            Files ({counts.files})
          </button>

          {counts.errors > 0 ? (
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition-colors ${
                filterType === 'errors'
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
              }`}
              onClick={() => setFilterType('errors')}
            >
              <AlertTriangle size={10} />
              Errors ({counts.errors})
            </button>
          ) : null}
        </div>
      </div>

      {/* Main Events Scroll Feed */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative min-h-0 flex-1 overflow-y-auto p-3 space-y-2.5"
      >
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-[var(--muted)]">
            <Search size={24} className="mb-2 text-[var(--muted)]/50" />
            <div className="font-medium text-[var(--text)]">No matching events</div>
            <div className="mt-1 text-[11px]">
              {searchQuery || filterType !== 'all' || selectedAgent
                ? 'Try clearing the search query or active filters.'
                : 'Agent work and streaming updates will appear here.'}
            </div>
            {(searchQuery || filterType !== 'all' || selectedAgent) ? (
              <button
                type="button"
                className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--glass)] px-3 py-1 text-xs text-[var(--text)] hover:bg-[var(--border)]"
                onClick={() => {
                  setSearchQuery('')
                  setFilterType('all')
                  onSelectAgent?.(null)
                }}
              >
                Reset filters
              </button>
            ) : null}
          </div>
        ) : (
          filteredEvents.map((event) => {
            if (event.kind === 'progress') {
              return <AgentHandoffCard key={event.id} event={event} />
            }
            if (event.kind === 'message') {
              return <AgentMessageCard key={event.id} event={event} />
            }
            if (event.kind === 'tool_call') {
              return <ToolCallCard key={event.id} call={event} />
            }
            if (event.kind === 'error') {
              return <AgentErrorCard key={event.id} event={event} />
            }
            if (event.kind === 'completed') {
              return (
                <AgentCompletedCard
                  key={event.id}
                  event={event}
                  stats={{
                    duration: completedAt && startedAt ? completedAt - startedAt : null,
                    toolCount: counts.tools,
                    stepCount: events.filter((e) => e.kind === 'progress').length,
                  }}
                />
              )
            }
            if (event.kind === 'start') {
              return (
                <div
                  key={event.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--editor)]/60 px-3 py-2 text-xs text-[var(--muted)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-blue-400" />
                    <span>Run started: <span className="text-[var(--text)] font-medium">&ldquo;{event.task}&rdquo;</span></span>
                  </div>
                  <span className="text-[10px]">{formatTimestamp(event.timestamp)}</span>
                </div>
              )
            }
            if (event.kind === 'cancelled') {
              return (
                <div
                  key={event.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--editor)] px-3 py-2 text-xs text-[var(--warning)] flex items-center gap-2"
                >
                  <AlertTriangle size={12} />
                  <span>Agent run was cancelled by user</span>
                </div>
              )
            }

            return null
          })
        )}

        {/* Streaming Pulse Indicator at the bottom */}
        {isStreaming ? (
          <div className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-950/20 px-3 py-2 text-xs text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <span className="font-medium animate-pulse">
              Agent is active and processing stream events...
            </span>
          </div>
        ) : null}

        {/* Auto-scroll target */}
        <div ref={sentinelRef} className="h-1" />
      </div>

      {/* Floating Scroll To Bottom Button */}
      {userScrolledUp ? (
        <div className="absolute bottom-3 right-4 z-20">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-[var(--primary)] bg-[var(--panel-2)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-lg hover:bg-[var(--glass)] transition-all animate-bounce"
            onClick={() => scrollToBottom(true)}
          >
            <ArrowDown size={13} className="text-[var(--primary)]" />
            <span>Latest events</span>
            {unseenCount > 0 ? (
              <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.2 text-[10px] font-bold text-[#121216]">
                +{unseenCount}
              </span>
            ) : null}
          </button>
        </div>
      ) : null}
    </div>
  )
}
