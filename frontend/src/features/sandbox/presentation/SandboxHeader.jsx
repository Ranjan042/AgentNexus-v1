import { useEffect } from 'react'
import { ExternalLink, Hexagon, Play, RefreshCw, Save, Settings as SettingsIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import SandboxStatus from './SandboxStatus'
import { listWorkspaceFiles } from '../../fileExplorer/application/fileThunks'
import { saveActiveFile } from '../../editor/application/editorThunks'
import { runAgent } from '../../agents/application/agentThunks'
import { selectSandboxId } from '../application/sandboxSelectors'
import { selectAgentStatus, selectAgentTask } from '../../agents/application/agentSelectors'
import { selectEditorSaving } from '../../editor/application/editorSelectors'
import { selectLivePreviewUrl } from '../../preview/application/previewSelectors'
import { openPreviewInNewTab } from '../../preview/application/previewUtils'
import { getSavedToken } from '../../auth/infrastructure/authApi'
import { getSandboxPreviewUrl } from '../../../shared/api/apiConfig'
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '../../auth/application/authSelectors'
import { openAuthModal } from '../../auth/domain/authSlice'
import { pushToast } from '../../ui/domain/uiSlice'
import UserProfileMenu from '../../auth/presentation/UserProfileMenu'
import GoogleSignInButton from '../../auth/presentation/GoogleSignInButton'

export default function SandboxHeader() {
  const dispatch = useDispatch()
  const sandboxId = useSelector(selectSandboxId)
  const task = useSelector(selectAgentTask)
  const agentStatus = useSelector(selectAgentStatus)
  const saving = useSelector(selectEditorSaving)

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectCurrentUser)

  const livePreviewUrl = useSelector(selectLivePreviewUrl)
  const token = useSelector((state) => state.auth?.token) || getSavedToken()

  // Respond to secondary postMessage token requests only from verified preview subdomains
  useEffect(() => {
    const handleAuthMessage = (e) => {
      if (!token || !e.origin) return

      // Strict origin validation: only accept requests from sandbox preview domains
      const isAllowedPreviewOrigin =
        /^http:\/\/sandbox-[a-zA-Z0-9-]+\.preview\.localhost(:\d+)?$/.test(e.origin) ||
        /^http:\/\/localhost(:\d+)?$/.test(e.origin)

      if (!isAllowedPreviewOrigin) {
        return
      }

      if (e.data && e.data.type === 'REQUEST_AGENTNEXUS_AUTH') {
        if (e.source && typeof e.source.postMessage === 'function') {
          // Never use wildcard '*', always target the validated sender origin
          e.source.postMessage({ type: 'AGENTNEXUS_AUTH_TOKEN', token }, e.origin)
        }
      }
    }
    window.addEventListener('message', handleAuthMessage)
    return () => window.removeEventListener('message', handleAuthMessage)
  }, [token])

  const handleRunAgent = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal())
      dispatch(
        pushToast({
          type: 'warning',
          message: 'Please sign in to your AgentNexus account to run the AI agent.',
        })
      )
      return
    }
    dispatch(runAgent(task))
  }

  const handleOpenPreview = () => {
    if (!sandboxId) return
    const baseUrl = livePreviewUrl || getSandboxPreviewUrl(sandboxId)
    openPreviewInNewTab(baseUrl, token)
  }

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
          onClick={handleRunAgent}
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
          title="Open live preview in a new Chrome tab"
          onClick={handleOpenPreview}
          disabled={!sandboxId}
        >
          <ExternalLink size={14} /> Preview
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
