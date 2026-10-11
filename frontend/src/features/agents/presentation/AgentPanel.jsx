import { useSelector } from 'react-redux'
import StatusBadge from '../../../shared/components/StatusBadge'
import EmptyState from '../../../shared/components/EmptyState'
import AgentTaskInput from './AgentTaskInput'
import AgentProgress from './AgentProgress'
import AgentEvents from './AgentEvents'
import { selectAgent } from '../application/agentSelectors'

export default function AgentPanel() {
  const agent = useSelector(selectAgent)
  const live = agent.status === 'running' || agent.status === 'connecting'

  return (
    <aside className="panel h-full">
      <div className="panel-header">
        <span>AI Agent</span>
        <StatusBadge status={live ? 'live' : agent.status} label={live ? 'LIVE' : agent.status} />
      </div>
      <AgentTaskInput />
      {agent.status === 'idle' && !agent.progress.length ? (
        <EmptyState
          title="Your AI coding agent is ready."
          description="Describe what you want to build."
        />
      ) : (
        <>
          <AgentProgress />
          <AgentEvents />
        </>
      )}
    </aside>
  )
}
