import { useDispatch, useSelector } from 'react-redux'
import { X } from 'lucide-react'
import { getBasename } from '../../../shared/utils/language'
import { closeTab, setActiveTab } from '../domain/editorSlice'
import { selectActiveTab, selectDirtyFiles, selectOpenTabs } from '../application/editorSelectors'

export default function EditorTabs() {
  const dispatch = useDispatch()
  const tabs = useSelector(selectOpenTabs)
  const active = useSelector(selectActiveTab)
  const dirty = useSelector(selectDirtyFiles)

  if (!tabs.length) {
    return null
  }

  return (
    <div className="tabs">
      {tabs.map((path) => (
        <button
          key={path}
          type="button"
          className={`tab ${path === active ? 'active' : ''}`}
          onClick={() => dispatch(setActiveTab(path))}
        >
          <span>
            {getBasename(path)}
            {dirty.includes(path) ? ' •' : ''}
          </span>
          <span
            className="close"
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation()
              dispatch(closeTab(path))
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                dispatch(closeTab(path))
              }
            }}
          >
            <X size={12} />
          </span>
        </button>
      ))}
    </div>
  )
}
