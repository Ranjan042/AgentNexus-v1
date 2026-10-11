import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from "monaco-editor/editor/editor.worker.js?worker";
import jsonWorker from "monaco-editor/language/json/json.worker.js?worker";
import cssWorker from "monaco-editor/language/css/css.worker.js?worker";
import htmlWorker from "monaco-editor/language/html/html.worker.js?worker";
import tsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";

let configured = false

export const ANTIGRAVITY_THEME = 'agentnexus-antigravity'

export function setupMonaco() {
  if (configured) {
    return
  }

  configured = true

  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    },
  }

  loader.config({ monaco })

  monaco.editor.defineTheme(ANTIGRAVITY_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '80868b', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c4b5fd' },
      { token: 'string', foreground: '81c995' },
      { token: 'number', foreground: 'fdd663' },
      { token: 'type', foreground: '8ab4f8' },
      { token: 'delimiter', foreground: '9aa0a6' },
    ],
    colors: {
      'editor.background': '#1a1c21',
      'editor.foreground': '#e8eaed',
      'editorLineNumber.foreground': '#5f6368',
      'editorLineNumber.activeForeground': '#e8eaed',
      'editorCursor.foreground': '#8ab4f8',
      'editor.selectionBackground': '#3c4a6a88',
      'editor.inactiveSelectionBackground': '#30343c88',
      'editor.lineHighlightBackground': '#22252c',
      'editorWidget.background': '#181a1d',
      'editorWidget.border': '#2a2d35',
      'editorSuggestWidget.background': '#181a1d',
      'editorSuggestWidget.selectedBackground': '#2b3344',
      'minimap.background': '#1a1c21',
      'scrollbarSlider.background': '#3c40434d',
      'editorGutter.background': '#1a1c21',
    },
  })
}

export function getMonacoOptions({ wordWrap, minimap, fontSize }) {
  return {
    fontSize,
    fontFamily: "ui-monospace, 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
    minimap: { enabled: minimap },
    wordWrap,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    renderLineHighlight: 'line',
    tabSize: 2,
    padding: { top: 8 },
    bracketPairColorization: { enabled: true },
    formatOnPaste: false,
    formatOnType: false,
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    glyphMargin: false,
    folding: true,
  }
}
