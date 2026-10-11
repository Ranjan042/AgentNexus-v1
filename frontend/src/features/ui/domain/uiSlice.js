import { createSlice } from '@reduxjs/toolkit'
import { STORAGE_KEYS, UI_DEFAULTS } from '../../../shared/constants/storage'
import { createId } from '../../../shared/utils/id'

function loadUi() {
  try {
    return { ...UI_DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.UI) || '{}') }
  } catch {
    return { ...UI_DEFAULTS }
  }
}

const persisted = loadUi()

const initialState = {
  theme: persisted.theme || 'dark',
  leftPanelWidth: persisted.leftPanelWidth,
  rightPanelWidth: persisted.rightPanelWidth,
  bottomPanelHeight: persisted.bottomPanelHeight,
  leftPanelOpen: persisted.leftPanelOpen,
  rightPanelOpen: persisted.rightPanelOpen,
  bottomPanelOpen: persisted.bottomPanelOpen,
  bottomTab: 'terminal',
  leftTab: 'explorer',
  commandPaletteOpen: false,
  quickOpenOpen: false,
  wordWrap: persisted.wordWrap,
  minimap: persisted.minimap,
  fontSize: persisted.fontSize,
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLeftPanelWidth(state, action) {
      state.leftPanelWidth = action.payload
    },
    setRightPanelWidth(state, action) {
      state.rightPanelWidth = action.payload
    },
    setBottomPanelHeight(state, action) {
      state.bottomPanelHeight = action.payload
    },
    toggleLeftPanel(state) {
      state.leftPanelOpen = !state.leftPanelOpen
    },
    toggleRightPanel(state) {
      state.rightPanelOpen = !state.rightPanelOpen
    },
    toggleBottomPanel(state) {
      state.bottomPanelOpen = !state.bottomPanelOpen
    },
    setLeftPanelOpen(state, action) {
      state.leftPanelOpen = action.payload
    },
    setRightPanelOpen(state, action) {
      state.rightPanelOpen = action.payload
    },
    setBottomTab(state, action) {
      state.bottomTab = action.payload
      state.bottomPanelOpen = true
    },
    setLeftTab(state, action) {
      state.leftTab = action.payload
      state.leftPanelOpen = true
    },
    setCommandPaletteOpen(state, action) {
      state.commandPaletteOpen = action.payload
      if (action.payload) {
        state.quickOpenOpen = false
      }
    },
    setQuickOpenOpen(state, action) {
      state.quickOpenOpen = action.payload
      if (action.payload) {
        state.commandPaletteOpen = false
      }
    },
    setWordWrap(state, action) {
      state.wordWrap = action.payload
    },
    setMinimap(state, action) {
      state.minimap = action.payload
    },
    setFontSize(state, action) {
      state.fontSize = action.payload
    },
    pushToast(state, action) {
      state.toasts.push({
        id: createId('toast'),
        type: action.payload.type || 'info',
        message: action.payload.message,
        createdAt: Date.now(),
      })
      if (state.toasts.length > 5) {
        state.toasts.shift()
      }
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
  },
})

export const {
  setLeftPanelWidth,
  setRightPanelWidth,
  setBottomPanelHeight,
  toggleLeftPanel,
  toggleRightPanel,
  toggleBottomPanel,
  setLeftPanelOpen,
  setRightPanelOpen,
  setBottomTab,
  setLeftTab,
  setCommandPaletteOpen,
  setQuickOpenOpen,
  setWordWrap,
  setMinimap,
  setFontSize,
  pushToast,
  dismissToast,
} = uiSlice.actions

export default uiSlice.reducer
