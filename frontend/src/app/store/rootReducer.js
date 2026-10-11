import { combineReducers } from '@reduxjs/toolkit'
import sandboxReducer from '../../features/sandbox/domain/sandboxSlice'
import filesReducer from '../../features/fileExplorer/domain/filesSlice'
import editorReducer from '../../features/editor/domain/editorSlice'
import terminalReducer from '../../features/terminal/domain/terminalSlice'
import agentReducer from '../../features/agents/domain/agentSlice'
import previewReducer from '../../features/preview/domain/previewSlice'
import uiReducer from '../../features/ui/domain/uiSlice'

const rootReducer = combineReducers({
  sandbox: sandboxReducer,
  files: filesReducer,
  editor: editorReducer,
  terminal: terminalReducer,
  agent: agentReducer,
  preview: previewReducer,
  ui: uiReducer,
})

export default rootReducer
