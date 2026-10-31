import { useState } from 'react'
import { Copy, CheckCheck } from 'lucide-react'
import { getAgentMeta, formatTimestamp } from './agentConfig'

function formatMessageContent(content) {
  if (!content) return null

  // Quick split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g)

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineEnd = part.indexOf('\n')
      const lang = firstLineEnd !== -1 ? part.slice(3, firstLineEnd).trim() || 'code' : 'code'
      const code = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3)

      return (
        <div
          key={index}
          className="my-2 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--editor)]"
        >
          {lang && lang !== 'code' ? (
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--canvas)] px-2.5 py-1 text-[10px] font-mono uppercase text-[var(--muted)]">
              <span>{lang}</span>
            </div>
          ) : null}
          <pre className="overflow-x-auto p-2.5 font-mono text-[11px] leading-relaxed text-[var(--text)] whitespace-pre-wrap break-all">
            {code}
          </pre>
        </div>
      )
    }

    // Split paragraphs
    const paragraphs = part.split('\n\n')
    return (
      <div key={index} className="space-y-1.5">
        {paragraphs.map((p, pIdx) => {
          if (!p.trim()) return null

          // Render bullet list items nicely
          if (p.trim().startsWith('- ') || p.trim().startsWith('* ')) {
            const items = p.split('\n').filter((l) => l.trim())
            return (
              <ul key={pIdx} className="list-disc pl-4 space-y-1 my-1">
                {items.map((it, itIdx) => (
                  <li key={itIdx} className="text-xs leading-relaxed text-[var(--text)]">
                    {it.replace(/^[-*]\s+/, '')}
                  </li>
                ))}
              </ul>
            )
          }

          return (
            <p key={pIdx} className="text-xs leading-relaxed text-[var(--text)] whitespace-pre-wrap">
              {p}
            </p>
          )
        })}
      </div>
    )
  })
}

export default function AgentMessageCard({ event }) {
  const [copied, setCopied] = useState(false)
  const agentMeta = getAgentMeta(event.agent)
  const AgentIcon = agentMeta.Icon

  const handleCopy = () => {
    navigator.clipboard.writeText(event.content || '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="group rounded-xl border border-[var(--border)] bg-[var(--panel-2)]/60 p-3 text-xs transition-colors hover:border-[var(--border-strong)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-lg border ${agentMeta.pillClass}`}
          >
            <AgentIcon size={12} />
          </div>
          <span className="font-semibold text-[var(--text)]">
            {agentMeta.label}
          </span>
          <span className="rounded-full bg-[var(--glass)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
            Thought & Reason
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--muted)]">
            {formatTimestamp(event.timestamp)}
          </span>
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--glass)]"
            onClick={handleCopy}
            title="Copy message"
          >
            {copied ? (
              <CheckCheck size={12} className="text-[var(--success)]" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
      </div>

      <div className="mt-2 text-xs text-[var(--text)]">
        {formatMessageContent(event.content)}
      </div>
    </div>
  )
}
