import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useDispatch, useSelector } from 'react-redux'
import { getLanguageFromFilename } from '../infrastructure/languageMap'
import { ANTIGRAVITY_THEME, getMonacoOptions, setupMonaco } from '../infrastructure/monacoConfig'
import { saveActiveFile } from '../application/editorThunks'
import { setCursorTarget, updateFileContent } from '../domain/editorSlice'
import {
  selectActiveContent,
  selectActiveTab,
  selectCursorTarget,
} from '../application/editorSelectors'
import { selectUi } from '../../ui/application/uiSelectors'

setupMonaco()

export default function MonacoPane() {
  const dispatch = useDispatch()
  const path = useSelector(selectActiveTab)
  const value = useSelector(selectActiveContent)
  const cursorTarget = useSelector(selectCursorTarget)
  const ui = useSelector(selectUi)
  const editorRef = useRef(null)

  useEffect(() => {
    if (!cursorTarget || !editorRef.current || cursorTarget.path !== path) {
      return
    }
    const line = cursorTarget.line || 1
    editorRef.current.revealLineInCenter(line)
    editorRef.current.setPosition({ lineNumber: line, column: 1 })
    editorRef.current.focus()
    dispatch(setCursorTarget(null))
  }, [cursorTarget, path, dispatch])

  if (!path) {
    return null
  }

  return (
    <Editor
      path={path}
      theme={ANTIGRAVITY_THEME}
      language={getLanguageFromFilename(path)}
      value={value}
      options={getMonacoOptions({
        wordWrap: ui.wordWrap,
        minimap: ui.minimap,
        fontSize: ui.fontSize,
      })}
      onChange={(next) => dispatch(updateFileContent({ path, content: next ?? '' }))}
      onMount={(editor, monaco) => {
        editorRef.current = editor
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          dispatch(saveActiveFile())
        })
      }}
    />
  )
}
