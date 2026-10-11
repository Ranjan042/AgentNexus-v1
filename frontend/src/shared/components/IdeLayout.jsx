import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bot, Files, FolderSearch, Info } from 'lucide-react'
import SandboxHeader from '../../features/sandbox/presentation/SandboxHeader'
import FileExplorer from '../../features/fileExplorer/presentation/FileExplorer'
import FileSearchPanel from '../../features/fileExplorer/presentation/FileSearchPanel'
import WorkspaceInfo from '../../features/fileExplorer/presentation/WorkspaceInfo'
import EditorWorkspace from '../../features/editor/presentation/EditorWorkspace'
import AgentPanel from '../../features/agents/presentation/AgentPanel'
import TerminalPanel from '../../features/terminal/presentation/TerminalPanel'
import PreviewPanel from '../../features/preview/presentation/PreviewPanel'
import ResizableSplit from './ResizableSplit'
import { useMediaQuery } from '../hooks/useMediaQuery'
import {
  setBottomPanelHeight,
  setLeftPanelOpen,
  setLeftPanelWidth,
  setLeftTab,
  setRightPanelOpen,
  setRightPanelWidth,
  setBottomTab,
  toggleRightPanel,
} from '../../features/ui/domain/uiSlice'
import { selectUi } from '../../features/ui/application/uiSelectors'
import { selectAgentMessages, selectAgentToolCalls } from '../../features/agents/application/agentSelectors'
import { selectSandboxId, selectSandboxStatus } from '../../features/sandbox/application/sandboxSelectors'
import { selectActiveTab } from '../../features/editor/application/editorSelectors'
import { selectShellStatus } from '../../features/terminal/application/terminalSelectors'
import { getLanguageFromFilename } from '../utils/language'

const LEFT_TABS = [
  { id: 'explorer', icon: Files, title: 'Explorer' },
  { id: 'search', icon: FolderSearch, title: 'Search' },
  { id: 'workspace', icon: Info, title: 'Workspace' },
]

function LeftContent({ tab }) {
  if (tab === 'search') {
    return <FileSearchPanel />
  }
  if (tab === 'workspace') {
    return <WorkspaceInfo />
  }
  return <FileExplorer />
}

export default function IdeLayout({ children, showPreview = false }) {
  const dispatch = useDispatch()
  const ui = useSelector(selectUi)
  const compact = useMediaQuery('(max-width: 860px)')
  const startLeft = useRef(ui.leftPanelWidth)
  const startRight = useRef(ui.rightPanelWidth)
  const startBottom = useRef(ui.bottomPanelHeight)
  const agentMessages = useSelector(selectAgentMessages)
  const toolCalls = useSelector(selectAgentToolCalls)
  const sandboxId = useSelector(selectSandboxId)
  const sandboxStatus = useSelector(selectSandboxStatus)
  const activeTab = useSelector(selectActiveTab)
  const shellStatus = useSelector(selectShellStatus)

  useEffect(() => {
    if (compact) {
      dispatch(setLeftPanelOpen(false))
      dispatch(setRightPanelOpen(false))
    }
  }, [compact, dispatch])

  const leftWidth = ui.leftPanelOpen ? Math.max(200, ui.leftPanelWidth) : 0
  const rightWidth = ui.rightPanelOpen ? Math.max(280, ui.rightPanelWidth) : 0
  const bottomHeight = ui.bottomPanelOpen ? Math.max(140, ui.bottomPanelHeight) : 36
  const showDesktopLeft = ui.leftPanelOpen && !compact
  const showDesktopRight = ui.rightPanelOpen && !compact

  return (
    <div className="app-shell">
      <SandboxHeader />
      <div className="workspace-body">
        <nav className="activity-bar island" aria-label="Workspace activity">
          {LEFT_TABS.map((tab) => {
            const Icon = tab.icon
            const active = ui.leftTab === tab.id && ui.leftPanelOpen
            return (
              <button
                key={tab.id}
                type="button"
                className={`activity-btn ${active ? 'active' : ''}`}
                title={tab.title}
                aria-pressed={active}
                onClick={() => dispatch(setLeftTab(tab.id))}
              >
                <Icon size={18} />
              </button>
            )
          })}
          <div className="mt-auto">
            <button
              type="button"
              className={`activity-btn ${ui.rightPanelOpen ? 'active' : ''}`}
              title="AI Agent"
              aria-pressed={ui.rightPanelOpen}
              onClick={() => dispatch(toggleRightPanel())}
            >
              <Bot size={18} />
            </button>
          </div>
        </nav>
        <div className="ide-main">
          <div className="ide-center">
            {showDesktopLeft ? (
              <aside className="panel island" style={{ width: leftWidth, minWidth: 200 }}>
                <LeftContent tab={ui.leftTab} />
              </aside>
            ) : null}
            {showDesktopLeft ? (
              <ResizableSplit
                orientation="vertical"
                onResizeStart={() => {
                  startLeft.current = ui.leftPanelWidth
                }}
                onResize={({ dx }) => {
                  dispatch(setLeftPanelWidth(Math.min(480, Math.max(200, startLeft.current + dx))))
                }}
              />
            ) : null}
            <div className="editor-pane island" style={{ minWidth: 240 }}>
              {showPreview ? <PreviewPanel variant="page" /> : children || <EditorWorkspace />}
            </div>
            {showDesktopRight ? (
              <ResizableSplit
                orientation="vertical"
                onResizeStart={() => {
                  startRight.current = ui.rightPanelWidth
                }}
                onResize={({ dx }) => {
                  dispatch(setRightPanelWidth(Math.min(640, Math.max(280, startRight.current - dx))))
                }}
              />
            ) : null}
            {showDesktopRight ? (
              <div className="island" style={{ width: rightWidth, minWidth: 280 }}>
                <AgentPanel />
              </div>
            ) : null}
          </div>
          {ui.bottomPanelOpen ? (
            <ResizableSplit
              orientation="horizontal"
              onResizeStart={() => {
                startBottom.current = ui.bottomPanelHeight
              }}
              onResize={({ dy }) => {
                dispatch(setBottomPanelHeight(Math.min(480, Math.max(140, startBottom.current - dy))))
              }}
            />
          ) : null}
          <section className="panel island" style={{ height: bottomHeight }}>
            <div className="tabs">
              {[
                ['terminal', 'Terminal'],
                ['output', 'Output'],
                ['agent-logs', 'Agent Logs'],
                ['problems', 'Problems'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`tab ${ui.bottomTab === id ? 'active' : ''}`}
                  onClick={() => dispatch(setBottomTab(id))}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {ui.bottomTab === 'terminal' ? <TerminalPanel /> : null}
              {ui.bottomTab === 'output' ? (
                <div className="p-3 text-xs text-[var(--muted)]">
                  Workspace output will appear here after commands and agent runs.
                </div>
              ) : null}
              {ui.bottomTab === 'agent-logs' ? (
                <div className="h-full overflow-auto p-3 text-xs">
                  {agentMessages.map((message) => (
                    <div key={message.id} className="mb-2 whitespace-pre-wrap">
                      {message.content}
                    </div>
                  ))}
                  {toolCalls.map((call) => (
                    <div key={call.id} className="mb-2 text-[var(--muted)]">
                      {call.tool} — {call.status}
                    </div>
                  ))}
                  {!agentMessages.length && !toolCalls.length ? (
                    <div className="text-[var(--muted)]">No agent logs yet.</div>
                  ) : null}
                </div>
              ) : null}
              {ui.bottomTab === 'problems' ? (
                <div className="p-3 text-xs text-[var(--muted)]">No problems detected.</div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
      {compact && ui.leftPanelOpen ? (
        <div className="drawer left">
          <LeftContent tab={ui.leftTab} />
        </div>
      ) : null}
      {compact && ui.rightPanelOpen ? (
        <div className="drawer right">
          <AgentPanel />
        </div>
      ) : null}
      <footer className="status-bar island">
        <span>
          {sandboxStatus} {sandboxId ? `· ${sandboxId.slice(0, 8)}` : ''}
        </span>
        <span>
          {activeTab ? getLanguageFromFilename(activeTab) : 'plaintext'} · PTY {shellStatus}
        </span>
      </footer>
    </div>
  )
}
