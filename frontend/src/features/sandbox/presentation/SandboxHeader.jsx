import { Hexagon, Play, RefreshCw, Save, Settings as SettingsIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import SandboxStatus from './SandboxStatus'
import { listWorkspaceFiles } from '../../fileExplorer/application/fileThunks'
import { saveActiveFile } from '../../editor/application/editorThunks'
import { runAgent } from '../../agents/application/agentThunks'
import { selectSandboxId } from '../application/sandboxSelectors'
import { selectAgentStatus, selectAgentTask } from '../../agents/application/agentSelectors'
// import { selectShellStatus } from '../../terminal/application/terminalSelectors'
import { selectEditorSaving } from '../../editor/application/editorSelectors'
import StatusBadge from '../../../shared/components/StatusBadge'

export default function SandboxHeader() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sandboxId = useSelector(selectSandboxId)
  const task = useSelector(selectAgentTask)
  const agentStatus = useSelector(selectAgentStatus)
  // const shellStatus = useSelector(selectShellStatus)
  const saving = useSelector(selectEditorSaving)

  return (
    <header className="ide-header island">
      <div className="flex min-w-0 items-center gap-4">
        <Link to="/" className="brand">
          <Hexagon className="brand-mark" />
          AgentNexus
        </Link>
        <SandboxStatus />
        {/* <StatusBadge
          status={shellStatus === 'connected' ? 'connected' : 'disconnected'}
          label={shellStatus === 'connected' ? 'Connected' : 'Offline'}
        /> */}
      </div>
      <div className="flex items-center gap-1">
        {saving ? <span className="px-2 text-xs text-[var(--muted)]">Saving...</span> : null}
        <button
          type="button"
          className="ghost-btn"
          onClick={() => dispatch(runAgent(task))}
          disabled={agentStatus === 'running' || agentStatus === 'connecting'}
        >
          <Play size={14} /> Run
        </button>
        <button type="button" className="ghost-btn" onClick={() => dispatch(saveActiveFile())}>
          <Save size={14} /> Save
        </button>
        <button type="button" className="ghost-btn" onClick={() => dispatch(listWorkspaceFiles())}>
          <RefreshCw size={14} /> Refresh
        </button>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => sandboxId && navigate(`/workspace/${sandboxId}/preview`)}
        >
          Preview
        </button>
        <Link to="/settings" className="ghost-btn" title="Settings">
          <SettingsIcon size={14} />
        </Link>
      </div>
    </header>
  )
}
