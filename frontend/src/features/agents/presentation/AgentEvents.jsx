import { useSelector } from 'react-redux'
import { selectAgent } from '../application/agentSelectors'
import ToolCallCard from './ToolCallCard'

function formatTime(value) {
  return new Date(value).toLocaleTimeString()
}

export default function AgentEvents() {
  const agent = useSelector(selectAgent)

  return (
    <div className="min-h-0 flex-1 overflow-auto p-3">
      <div className="panel-header !border-0 !px-0">Events</div>
      <div className="space-y-3">
        {agent.progress.map((item) => (
          <div key={item.id} className="text-xs">
            <div className="text-[var(--muted)]">
              {formatTime(item.timestamp)} {item.agent}
            </div>
            <div>{item.task || `Next: ${item.nextAgent || 'finish'}`}</div>
          </div>
        ))}
        {agent.messages.map((message) => (
          <div key={message.id} className="text-xs">
            <div className="text-[var(--muted)]">{formatTime(message.timestamp)} message</div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        {agent.toolCalls.map((call) => (
          <ToolCallCard key={call.id} call={call} />
        ))}
      </div>
    </div>
  )
}
