import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectUi } from '../features/ui/application/uiSelectors'
import { setFontSize, setMinimap, setWordWrap } from '../features/ui/domain/uiSlice'
import { selectSandboxId } from '../features/sandbox/application/sandboxSelectors'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const ui = useSelector(selectUi)
  const sandboxId = useSelector(selectSandboxId)

  return (
    <div className="h-full overflow-auto bg-[var(--canvas)] p-8">
      <div className="island mx-auto max-w-xl p-6">
        <Link to={sandboxId ? `/workspace/${sandboxId}` : '/'} className="text-sm text-[var(--primary)]">
          Back to workspace
        </Link>
        <h1 className="mt-4 text-xl font-medium">Settings</h1>
        <div className="mt-6 space-y-4 text-sm">
          <label className="flex items-center justify-between">
            Word wrap
            <select
              value={ui.wordWrap}
              onChange={(event) => dispatch(setWordWrap(event.target.value))}
              className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2 py-1"
            >
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </label>
          <label className="flex items-center justify-between">
            Minimap
            <input
              type="checkbox"
              checked={ui.minimap}
              onChange={(event) => dispatch(setMinimap(event.target.checked))}
            />
          </label>
          <label className="flex items-center justify-between">
            Font size
            <input
              type="number"
              min="11"
              max="22"
              value={ui.fontSize}
              onChange={(event) => dispatch(setFontSize(Number(event.target.value)))}
              className="w-20 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2 py-1"
            />
          </label>
          <div className="text-[var(--muted)]">Theme: Antigravity Dark</div>
        </div>
      </div>
    </div>
  )
}
