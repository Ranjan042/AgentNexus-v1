import { useDispatch, useSelector } from 'react-redux'
import { cancelAgentRun, runAgent } from '../application/agentThunks'
import { setTask } from '../domain/agentSlice'
import { selectAgentStatus, selectAgentTask } from '../application/agentSelectors'

export default function AgentTaskInput() {
  const dispatch = useDispatch()
  const task = useSelector(selectAgentTask)
  const status = useSelector(selectAgentStatus)
  const running = status === 'connecting' || status === 'running'

  return (
    <div className="border-b border-[var(--border)] p-3">
      <div className="mb-2 text-sm text-[var(--text)]">What do you want to build?</div>
      <textarea
        value={task}
        onChange={(event) => dispatch(setTask(event.target.value))}
        rows={4}
        placeholder="Add Tic Tac Toe page and configure routing"
        className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--editor)] p-2 text-sm text-[var(--text)] outline-none"
      />
      {running ? (
        <button type="button" className="ghost-btn mt-3 w-full justify-center" onClick={() => cancelAgentRun()}>
          Cancel agent
        </button>
      ) : (
        <button
          type="button"
          className="primary-btn mt-3 w-full"
          disabled={!task.trim()}
          onClick={() => dispatch(runAgent(task))}
        >
          Run Agent
        </button>
      )}
    </div>
  )
}
