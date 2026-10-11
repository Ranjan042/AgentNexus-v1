import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './rootReducer'
import { STORAGE_KEYS } from '../../shared/constants/storage'

const persistUi = (storeApi) => (next) => (action) => {
  const result = next(action)
  if (typeof action.type === 'string' && action.type.startsWith('ui/')) {
    const { ui } = storeApi.getState()
    localStorage.setItem(
      STORAGE_KEYS.UI,
      JSON.stringify({
        theme: ui.theme,
        leftPanelWidth: ui.leftPanelWidth,
        rightPanelWidth: ui.rightPanelWidth,
        bottomPanelHeight: ui.bottomPanelHeight,
        leftPanelOpen: ui.leftPanelOpen,
        rightPanelOpen: ui.rightPanelOpen,
        bottomPanelOpen: ui.bottomPanelOpen,
        wordWrap: ui.wordWrap,
        minimap: ui.minimap,
        fontSize: ui.fontSize,
      }),
    )
  }
  return result
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistUi),
})
