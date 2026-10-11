import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setQuickOpenOpen } from '../../features/ui/domain/uiSlice'
import { selectFileItems } from '../../features/fileExplorer/application/fileSelectors'
import { openWorkspaceFile } from '../../features/editor/application/editorThunks'

export default function QuickOpen() {
  const dispatch = useDispatch()
  const open = useSelector((state) => state.ui.quickOpenOpen)
  const files = useSelector(selectFileItems)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)

  const items = useMemo(
    () => files.filter((path) => path.toLowerCase().includes(query.toLowerCase())).slice(0, 40),
    [files, query],
  )

  if (!open) {
    return null
  }

  const select = (path) => {
    dispatch(openWorkspaceFile({ path }))
    dispatch(setQuickOpenOpen(false))
    setQuery('')
  }

  return (
    <div className="overlay" onClick={() => dispatch(setQuickOpenOpen(false))}>
      <div className="palette" onClick={(event) => event.stopPropagation()}>
        <input
          autoFocus
          value={query}
          placeholder="Open file"
          onChange={(event) => {
            setQuery(event.target.value)
            setIndex(0)
          }}
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
              select(items[index])
            }
            if (event.key === 'Escape') {
              dispatch(setQuickOpenOpen(false))
            }
          }}
        />
        <div className="max-h-80 overflow-auto py-1">
          {items.map((path, itemIndex) => (
            <button
              key={path}
              type="button"
              className={`palette-item ${itemIndex === index ? 'active' : ''}`}
              onClick={() => select(path)}
            >
              <span>{path}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
