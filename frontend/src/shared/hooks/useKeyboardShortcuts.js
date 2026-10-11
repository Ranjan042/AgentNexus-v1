import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setCommandPaletteOpen,
  setQuickOpenOpen,
  toggleBottomPanel,
  toggleLeftPanel,
  toggleRightPanel,
} from '../../features/ui/domain/uiSlice'
import { saveActiveFile } from '../../features/editor/application/editorThunks'

export function useKeyboardShortcuts() {
  const dispatch = useDispatch()
  const paletteOpen = useSelector((state) => state.ui.commandPaletteOpen)

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase()
      const ctrl = event.ctrlKey || event.metaKey

      if (ctrl && event.shiftKey && key === 'p') {
        event.preventDefault()
        dispatch(setCommandPaletteOpen(!paletteOpen))
        return
      }
      if (ctrl && key === 'p') {
        event.preventDefault()
        dispatch(setQuickOpenOpen(true))
        return
      }
      if (ctrl && key === 's') {
        event.preventDefault()
        dispatch(saveActiveFile())
        return
      }
      if (ctrl && key === '`') {
        event.preventDefault()
        dispatch(toggleBottomPanel())
        return
      }
      if (ctrl && key === 'b') {
        event.preventDefault()
        dispatch(toggleLeftPanel())
        return
      }
      if (ctrl && event.shiftKey && key === 'a') {
        event.preventDefault()
        dispatch(toggleRightPanel())
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, paletteOpen])
}
