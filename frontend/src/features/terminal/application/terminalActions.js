import { createAsyncThunk } from '@reduxjs/toolkit'
import { createTerminalConnection } from '../infrastructure/terminalSocket'
import { setStatus } from '../domain/terminalSlice'
import { pushToast } from '../../ui/domain/uiSlice'

let connection = null
let reconnectTimer = null
let reconnectAttempt = 0
let xtermWriter = null

export function registerTerminalWriter(writer) {
  xtermWriter = writer
}

export function getTerminalConnection() {
  return connection
}

export const connectTerminal = createAsyncThunk(
  'terminal/connect',
  async (sandboxIdArg, { getState, dispatch }) => {
    const sandboxId = sandboxIdArg || getState().sandbox.sandboxId
    if (!sandboxId) {
      throw new Error('No sandbox is running')
    }

    disconnectTerminalInternal()
    dispatch(setStatus('connecting'))

    return await new Promise((resolve, reject) => {
      connection = createTerminalConnection(sandboxId, {
        onOpen() {
          reconnectAttempt = 0
          dispatch(setStatus('connected'))
          resolve({ sandboxId })
        },
        onData(data) {
          xtermWriter?.(typeof data === 'string' ? data : String(data))
        },
        onError() {
          dispatch(setStatus('error'))
          dispatch(pushToast({ type: 'warning', message: 'Terminal disconnected' }))
          reject(new Error('Terminal socket error'))
        },
        onClose({ closedByUser }) {
          dispatch(setStatus('disconnected'))
          if (!closedByUser) {
            scheduleReconnect(sandboxId, dispatch)
          }
        },
      })
    })
  },
)

function scheduleReconnect(sandboxId, dispatch) {
  reconnectAttempt += 1
  if (reconnectAttempt > 6) {
    return
  }

  dispatch(setStatus('reconnecting'))
  reconnectTimer = setTimeout(() => {
    dispatch(connectTerminal(sandboxId))
  }, Math.min(1000 * 2 ** reconnectAttempt, 8000))
}

function disconnectTerminalInternal() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  connection?.close()
  connection = null
}

export const disconnectTerminal = createAsyncThunk('terminal/disconnect', async () => {
  disconnectTerminalInternal()
  return true
})

export function sendTerminalInput(data) {
  connection?.sendInput(data)
}

export function resizeTerminal(cols, rows) {
  connection?.resize(cols, rows)
}
