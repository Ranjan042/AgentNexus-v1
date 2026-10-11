export const selectOpenTabs = (state) => state.editor.openTabs
export const selectActiveTab = (state) => state.editor.activeTab
export const selectFileContents = (state) => state.editor.fileContents
export const selectDirtyFiles = (state) => state.editor.dirtyFiles
export const selectEditorSaving = (state) => state.editor.saving
export const selectLastSavedAt = (state) => state.editor.lastSavedAt
export const selectSaveError = (state) => state.editor.saveError
export const selectEditorOpening = (state) => state.editor.opening
export const selectCursorTarget = (state) => state.editor.cursorTarget
export const selectActiveContent = (state) =>
  state.editor.activeTab ? state.editor.fileContents[state.editor.activeTab] ?? '' : ''
export const selectIsDirty = (path) => (state) => state.editor.dirtyFiles.includes(path)
