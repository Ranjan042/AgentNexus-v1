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
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white hover:opacity-90">
          <Hexagon className="text-[var(--primary)]" size={18} />
          AgentNexus
        </Link>
        <span className="text-xs text-[var(--muted)]">/</span>
        <span className="truncate text-xs font-mono text-[var(--muted)]">{sandboxId || 'No sandbox'}</span>
        <SandboxStatus />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="ghost-btn"
          onClick={() => dispatch(listWorkspaceFiles())}
          title="Refresh file tree"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>

        <button
          type="button"
          className="ghost-btn"
          onClick={() => dispatch(saveActiveFile())}
          disabled={saving}
          title="Save active file (Ctrl/Cmd+S)"
        >
          <Save size={13} />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>

        <button
          type="button"
          className="primary-btn"
          onClick={() => dispatch(runAgent(task))}
          disabled={!task || agentStatus === 'running'}
        >
          <Play size={13} />
          <span>{agentStatus === 'running' ? 'Agent busy...' : 'Run Agent'}</span>
        </button>

        <button
          type="button"
          className="ghost-btn"
          onClick={() => navigate('/settings')}
          title="Settings"
        >
          <SettingsIcon size={14} />
        </button>
      </div>
    </header>
  )
}
