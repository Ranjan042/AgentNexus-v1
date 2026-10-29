import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { COMMANDS } from '../constants/commands'
import {
  setCommandPaletteOpen,
  setQuickOpenOpen,
  toggleBottomPanel,
  toggleLeftPanel,
  toggleRightPanel,
} from '../../features/ui/domain/uiSlice'
import { startSandbox } from '../../features/sandbox/application/sandboxThunks'
import { listWorkspaceFiles } from '../../features/fileExplorer/application/fileThunks'
import { saveActiveFile, saveAllFiles } from '../../features/editor/application/editorThunks'
import { runAgent } from '../../features/agents/application/agentThunks'
import { selectAgentTask } from '../../features/agents/application/agentSelectors'
import { refreshPreview } from '../../features/preview/application/previewThunks'
import { selectIsAuthenticated } from '../../features/auth/application/authSelectors'
import { openAuthModal } from '../../features/auth/domain/authSlice'

export default function CommandPalette() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const open = useSelector((state) => state.ui.commandPaletteOpen)
  const task = useSelector(selectAgentTask)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)

  const items = useMemo(
    () =>
      COMMANDS.filter((command) => command.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  useEffect(() => {
    const timer = setTimeout(() => setIndex(0), 0)
    return () => clearTimeout(timer)
  }, [query, open])

  if (!open) {
    return null
  }

  const run = (command) => {
    dispatch(setCommandPaletteOpen(false))
    switch (command.id) {
      case 'file.open':
        dispatch(setQuickOpenOpen(true))
        break
      case 'file.save':
        dispatch(saveActiveFile())
        break
      case 'file.saveAll':
        dispatch(saveAllFiles())
        break
      case 'file.refresh':
        dispatch(listWorkspaceFiles())
        break
      case 'agent.run':
        dispatch(runAgent(task))
        break
      case 'terminal.toggle':
        dispatch(toggleBottomPanel())
        break
      case 'files.toggle':
        dispatch(toggleLeftPanel())
        break
      case 'preview.toggle':
        dispatch(toggleRightPanel())
        break
      case 'preview.refresh':
        dispatch(refreshPreview())
        break
      case 'sandbox.start':
        if (!isAuthenticated) {
          dispatch(openAuthModal())
          break
        }
        dispatch(startSandbox()).then((action) => {
          if (action.payload?.sandboxId) {
            navigate(`/workspace/${action.payload.sandboxId}`)
          }
        })
        break
      case 'settings.open':
        navigate('/settings')
        break
      default:
        break
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIndex((prev) => Math.min(items.length - 1, prev + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIndex((prev) => Math.max(0, prev - 1))
    } else if (event.key === 'Enter' && items[index]) {
      event.preventDefault()
      run(items[index])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      dispatch(setCommandPaletteOpen(false))
    }
  }

  return (
    <div className="overlay" onClick={() => dispatch(setCommandPaletteOpen(false))}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a command or search..."
        />
        <div className="max-h-72 overflow-auto p-1">
          {items.map((command, idx) => (
            <button
              key={command.id}
              type="button"
              className={`palette-item ${idx === index ? 'active' : ''}`}
              onMouseEnter={() => setIndex(idx)}
              onClick={() => run(command)}
            >
              <span>{command.label}</span>
              {command.shortcut ? (
                <span className="font-mono text-xs text-[var(--muted)]">{command.shortcut}</span>
              ) : null}
            </button>
          ))}
          {items.length === 0 ? (
            <div className="p-3 text-center text-xs text-[var(--muted)]">No commands found</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
