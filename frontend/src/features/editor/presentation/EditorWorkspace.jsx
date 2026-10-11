import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import EditorTabs from './EditorTabs'
import MonacoPane from './MonacoPane'
import EditorEmpty from './EditorEmpty'
import Spinner from '../../../shared/components/Spinner'
import {
  selectActiveTab,
  selectEditorOpening,
  selectEditorSaving,
  selectLastSavedAt,
  selectSaveError,
} from '../application/editorSelectors'

export default function EditorWorkspace() {
  const active = useSelector(selectActiveTab)
  const opening = useSelector(selectEditorOpening)
  const saving = useSelector(selectEditorSaving)
  const lastSavedAt = useSelector(selectLastSavedAt)
  const saveError = useSelector(selectSaveError)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (!lastSavedAt) {
      return undefined
    }
    setShowSaved(true)
    const timer = setTimeout(() => setShowSaved(false), 2200)
    return () => clearTimeout(timer)
  }, [lastSavedAt])

  return (
    <section className="flex h-full min-h-0 flex-col">
      <EditorTabs />
      <div className="relative min-h-0 flex-1">
        {opening ? (
          <div className="absolute left-3 top-3 z-10">
            <Spinner label={active ? `Opening ${active}...` : 'Opening file...'} />
          </div>
        ) : null}
        {saving ? (
          <div className="absolute right-3 top-3 z-10 rounded-lg bg-[var(--panel)] px-2 py-1 text-xs text-[var(--muted)]">
            Saving...
          </div>
        ) : null}
        {!saving && showSaved ? (
          <div className="absolute right-3 top-3 z-10 rounded-lg bg-[var(--panel)] px-2 py-1 text-xs text-[var(--success)]">
            Saved
          </div>
        ) : null}
        {saveError ? (
          <div className="absolute right-3 top-10 z-10 rounded-lg bg-[var(--panel)] px-2 py-1 text-xs text-[var(--error)]">
            Failed to save file
          </div>
        ) : null}
        {active ? <MonacoPane /> : <EditorEmpty />}
      </div>
    </section>
  )
}
