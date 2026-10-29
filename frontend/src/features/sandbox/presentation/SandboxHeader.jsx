import { Hexagon, Play, RefreshCw, Save, Settings as SettingsIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import SandboxStatus from './SandboxStatus'
import { listWorkspaceFiles } from '../../fileExplorer/application/fileThunks'
import { saveActiveFile } from '../../editor/application/editorThunks'
import { runAgent } from '../../agents/application/agentThunks'
import { selectSandboxId } from '../application/sandboxSelectors'
import { selectAgentStatus, selectAgentTask } from '../../agents/application/agentSelectors'
import { selectEditorSaving } from '../../editor/application/editorSelectors'
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '../../auth/application/authSelectors'
import UserProfileMenu from '../../auth/presentation/UserProfileMenu'
import GoogleSignInButton from '../../auth/presentation/GoogleSignInButton'

export default function SandboxHeader() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sandboxId = useSelector(selectSandboxId)
  const task = useSelector(selectAgentTask)
  const agentStatus = useSelector(selectAgentStatus)
  const saving = useSelector(selectEditorSaving)

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectCurrentUser)

  return (
    <header className="ide-header island">
      <div className="flex min-w-0 items-center gap-4">
        <Link to="/" className="brand">
          <Hexagon className="brand-mark" />
          AgentNexus
        </Link>
        <SandboxStatus />
      </div>

      <div className="flex items-center gap-1.5">
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

        {/* Google Identity Integration */}
        <div className="ml-2 pl-2 border-l border-[var(--border)] flex items-center">
          {isAuthenticated && currentUser ? (
            <UserProfileMenu />
          ) : (
            <GoogleSignInButton
              text="Sign in"
              theme="dark"
              size="small"
              shape="pill"
            />
          )}
        </div>
      </div>
    </header>
  )
}
