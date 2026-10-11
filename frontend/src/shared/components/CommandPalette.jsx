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
import { selectSandboxId } from '../../features/sandbox/application/sandboxSelectors'
import { selectAgentTask } from '../../features/agents/application/agentSelectors'
import { refreshPreview } from '../../features/preview/application/previewThunks'

export default function CommandPalette() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const open = useSelector((state) => state.ui.commandPaletteOpen)
  const sandboxId = useSelector(selectSandboxId)
  const task = useSelector(selectAgentTask)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)

  const items = useMemo(
    () =>
      COMMANDS.filter((command) => command.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  useEffect(() => {
    setIndex(0)
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
      case 'sandbox.start':
        dispatch(startSandbox()).then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            navigate(`/workspace/${result.payload.sandboxId}`)
          }
        })
        break
      case 'files.refresh':
        dispatch(listWorkspaceFiles())
        break
      case 'agent.run':
        dispatch(runAgent(task))
        break
      case 'panel.terminal':
        dispatch(toggleBottomPanel())
        break
      case 'panel.ai':
        dispatch(toggleRightPanel())
        break
      case 'panel.explorer':
        dispatch(toggleLeftPanel())
        break
      case 'preview.open':
        if (sandboxId) {
          navigate(`/workspace/${sandboxId}/preview`)
        }
        break
      case 'preview.refresh':
        dispatch(refreshPreview())
        if (sandboxId) {
          navigate(`/workspace/${sandboxId}/preview`)
        }
        break
      default:
        break
    }
  }

  return (
    <div className="overlay" onClick={() => dispatch(setCommandPaletteOpen(false))}>
      <div className="palette" onClick={(event) => event.stopPropagation()}>
        <input
          autoFocus
          value={query}
          placeholder="Type a command"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setIndex((value) => Math.min(value + 1, items.length - 1))
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setIndex((value) => Math.max(value - 1, 0))
            }
            if (event.key === 'Enter' && items[index]) {
              run(items[index])
            }
            if (event.key === 'Escape') {
              dispatch(setCommandPaletteOpen(false))
            }
          }}
        />
        <div className="max-h-80 overflow-auto py-1">
          {items.map((command, itemIndex) => (
            <button
              key={command.id}
              type="button"
              className={`palette-item ${itemIndex === index ? 'active' : ''}`}
              onMouseEnter={() => setIndex(itemIndex)}
              onClick={() => run(command)}
            >
              <span>{command.label}</span>
              {command.hint ? <span className="text-[var(--muted)]">{command.hint}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
