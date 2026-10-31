import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Check,
  Copy,
  CheckCheck,
  LoaderCircle,
  X,
} from 'lucide-react'
import {
  getToolMeta,
  extractToolTarget,
  formatDuration,
  formatTimestamp,
} from './agentConfig'

export default function ToolCallCard({ call, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const [tab, setTab] = useState('input')
  const [copied, setCopied] = useState(false)

  const toolMeta = getToolMeta(call.tool)
  const ToolIcon = toolMeta.Icon
  const target = extractToolTarget(call.tool, call.input)
  const duration =
    call.completedAt && call.timestamp
      ? call.completedAt - call.timestamp
      : null

  const isRunning = call.status === 'running'
  const isCompleted = call.status === 'completed'
  const isFailed = call.status === 'failed' || call.status === 'error'

  const hasOutput = call.output !== null && call.output !== undefined
  const hasInput = call.input && Object.keys(call.input).length > 0

  const handleCopy = (e) => {
    e.stopPropagation()
    const content =
      tab === 'output'
        ? typeof call.output === 'object'
          ? JSON.stringify(call.output, null, 2)
          : String(call.output ?? '')
        : JSON.stringify(call.input, null, 2)

    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const formatPayload = (val) => {
    if (val === null || val === undefined) return 'No output returned'
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val)
        return JSON.stringify(parsed, null, 2)
      } catch {
        return val
      }
    }
    return JSON.stringify(val, null, 2)
  }

  return (
    <div
      className={`group rounded-xl border text-xs transition-all ${
        isRunning
          ? 'border-indigo-500/40 bg-indigo-950/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
          : isFailed
            ? 'border-rose-500/40 bg-rose-950/20'
            : 'border-[var(--border)] bg-[var(--panel-2)] hover:border-[var(--border-strong)]'
      }`}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2.5 p-2.5 text-left transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${toolMeta.badgeClass}`}
        >
          <ToolIcon size={12} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text)]">
              {call.tool || 'tool_call'}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${toolMeta.badgeClass}`}
            >
              {toolMeta.label}
            </span>
          </div>

          {target ? (
            <div className="mt-0.5 truncate font-mono text-[11px] text-[var(--muted)] group-hover:text-[var(--text)]">
              {target}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-300">
              <LoaderCircle size={10} className="animate-spin text-blue-400" />
              Running
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              <Check size={10} />
              {duration ? formatDuration(duration) : 'Done'}
            </span>
          ) : isFailed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-400">
              <X size={10} />
              Failed
            </span>
          ) : (
            <span className="text-[10px] text-[var(--muted)]">
              {formatTimestamp(call.timestamp)}
            </span>
          )}

          <div className="text-[var(--muted)]">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        </div>
      </button>

      {open ? (
        <div className="border-t border-[var(--border)] p-2.5 pt-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  tab === 'input'
                    ? 'bg-[var(--glass)] text-[var(--text)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
                onClick={() => setTab('input')}
              >
                Input / Parameters
                {hasInput ? (
                  <span className="ml-1 text-[10px] text-[var(--muted)]">
                    ({Object.keys(call.input).length})
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  tab === 'output'
                    ? 'bg-[var(--glass)] text-[var(--text)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
                onClick={() => setTab('output')}
              >
                Output / Result
                {hasOutput ? (
                  <span className="ml-1 text-[10px] text-[var(--success)]">•</span>
                ) : null}
              </button>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[var(--muted)] hover:bg-[var(--glass)] hover:text-[var(--text)]"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <CheckCheck size={12} className="text-[var(--success)]" />
                  <span className="text-[var(--success)]">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-lg border border-[var(--border)] bg-[var(--editor)] p-2">
            <pre className="max-h-56 overflow-auto font-mono text-[11px] leading-relaxed text-[var(--text)] selection:bg-indigo-500/30 whitespace-pre-wrap break-all">
              {tab === 'input'
                ? hasInput
                  ? JSON.stringify(call.input, null, 2)
                  : '{} (No arguments)'
                : hasOutput
                  ? formatPayload(call.output)
                  : isRunning
                    ? 'Awaiting response...'
                    : 'No output recorded'}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  )
}
