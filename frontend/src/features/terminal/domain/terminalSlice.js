import { createSlice } from '@reduxjs/toolkit'
import { SHELL_STATUS } from './terminalTypes'
import { connectTerminal, disconnectTerminal } from '../application/terminalActions'

const initialState = {
  connected: false,
  output: [],
  shellStatus: SHELL_STATUS.DISCONNECTED,
  reconnectAttempt:0
}

const terminalSlice = createSlice({
  name: 'terminal',
  initialState,
  
  reducers: {
    setStatus(state, action) {
      state.shellStatus = action.payload
      state.connected = action.payload === SHELL_STATUS.CONNECTED
    },
    appendOutput(state, action) {
      state.output.push(action.payload)
      if (state.output.length > 400) {
        state.output = state.output.slice(-400)
      }
    },
    clearOutput(state) {
      state.output = []
    },
    incReconnectAttempt(state){
      state.reconnectAttempt+=1;
    },
    renReconnectAttempt(state){
      state.reconnectAttempt=0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectTerminal.pending, (state) => {
        state.shellStatus = SHELL_STATUS.CONNECTING
      })
      .addCase(connectTerminal.fulfilled, (state) => {
        state.shellStatus = SHELL_STATUS.CONNECTED
        state.connected = true
      })
      .addCase(connectTerminal.rejected, (state) => {
        state.shellStatus = SHELL_STATUS.ERROR
        state.connected = false
      })
      .addCase(disconnectTerminal.fulfilled, (state) => {
        state.shellStatus = SHELL_STATUS.DISCONNECTED
        state.connected = false
      })
  },
})

export const { setStatus, appendOutput, clearOutput,incReconnectAttempt,renReconnectAttempt} = terminalSlice.actions
export default terminalSlice.reducer
