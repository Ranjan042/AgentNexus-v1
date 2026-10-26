import { createAsyncThunk } from '@reduxjs/toolkit'
import { createTerminalConnection } from '../infrastructure/terminalSocket'
import { setStatus } from '../domain/terminalSlice'
import { pushToast } from '../../ui/domain/uiSlice'

let connection = null
let currentSandboxId = null
let reconnectTimer = null
let reconnectAttempt = 0
let xtermWriter = null

export function registerTerminalWriter(writer) {
  xtermWriter = writer
}

export function getTerminalConnection() {
  return connection
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function disconnectTerminalInternal() {
  clearReconnectTimer()
  if (connection) {
    try {
      connection.close()
    } catch {
      // Ignore close errors on teardown
    }
    connection = null
  }
  currentSandboxId = null
}

export const connectTerminal = createAsyncThunk(
  'terminal/connect',
  async (sandboxIdArg, { getState, dispatch }) => {
    const sandboxId = sandboxIdArg || getState().sandbox.sandboxId
    if (!sandboxId) {
      throw new Error('No sandbox is running')
    }

    // If already connected or connecting to the exact same sandbox, don't recreate
    if (
      connection &&
      currentSandboxId === sandboxId &&
      (connection.getReadyState() === WebSocket.OPEN ||
        connection.getReadyState() === WebSocket.CONNECTING)
    ) {
      return { sandboxId }
    }

    clearReconnectTimer()
    disconnectTerminalInternal()

    currentSandboxId = sandboxId
    dispatch(setStatus('connecting'))

    return await new Promise((resolve, reject) => {
      let isSettled = false

      connection = createTerminalConnection(sandboxId, {
        onOpen() {
          if (isSettled) return
          isSettled = true
          reconnectAttempt = 0
          clearReconnectTimer()
          dispatch(setStatus('connected'))
          resolve({ sandboxId })
        },
        onData(data) {
          xtermWriter?.(typeof data === 'string' ? data : String(data))
        },
        onError() {
          if (!isSettled) {
            isSettled = true
            dispatch(setStatus('error'))
            reject(new Error('Terminal socket error'))
          }
        },
        onClose({ closedByUser }) {
          dispatch(setStatus('disconnected'))
          if (!closedByUser && currentSandboxId === sandboxId) {
            scheduleReconnect(sandboxId, dispatch)
          }
        },
      })
    })
  },
)

function scheduleReconnect(sandboxId, dispatch) {
  clearReconnectTimer()

  if (reconnectAttempt >= 5) {
    dispatch(setStatus('error'))
    dispatch(
      pushToast({
        type: 'warning',
        message: 'Terminal connection lost. Click Reconnect to try again.',
      }),
    )
    return
  }

  reconnectAttempt += 1
  dispatch(setStatus('reconnecting'))

  const delay = Math.min(1000 * 2 ** (reconnectAttempt - 1), 6000)
  reconnectTimer = setTimeout(() => {
    if (currentSandboxId === sandboxId) {
      dispatch(connectTerminal(sandboxId))
    }
  }, delay)
}

export const disconnectTerminal = createAsyncThunk(
  'terminal/disconnect',
  async (_, { dispatch }) => {
    reconnectAttempt = 0
    disconnectTerminalInternal()
    dispatch(setStatus('disconnected'))
    return true
  },
)

export function sendTerminalInput(data) {
  connection?.sendInput(data)
}

export function resizeTerminal(cols, rows) {
  connection?.resize(cols, rows)
}
