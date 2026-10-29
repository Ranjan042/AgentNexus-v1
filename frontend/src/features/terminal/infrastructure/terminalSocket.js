import { getTerminalSocketUrl } from '../../../shared/api/apiConfig'
import { AUTH_STORAGE_KEYS } from '../../auth/domain/authTypes'

export function createTerminalConnection(sandboxId, handlers = {}) {
  const url = getTerminalSocketUrl(sandboxId)

  const protocol =
    window.location.protocol === 'https:' ? 'wss:' : 'ws:'

  let token = null
  try {
    token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
  } catch {
    // Ignore storage errors
  }

  const joinChar = url.includes('?') ? '&' : '?'
  const tokenQuery = token ? `${joinChar}token=${encodeURIComponent(token)}` : ''
  const socketUrl = `${protocol}//${window.location.host}${url}${tokenQuery}`

  console.log('Terminal WebSocket URL:', socketUrl)

  const socket = new WebSocket(socketUrl)
  let closedByUser = false

  socket.addEventListener('open', () => {
    console.log('Terminal socket connected')
    handlers.onOpen?.()
  })

  socket.addEventListener('message', (event) => {
    handlers.onData?.(event.data)
  })

  socket.addEventListener('close', (event) => {
    console.log('Terminal socket closed')
    handlers.onClose?.({
      closedByUser,
      code: event.code,
      reason: event.reason,
    })
  })

  socket.addEventListener('error', () => {
    handlers.onError?.(new Error('Terminal socket error'))
  })

  return {
    url: socketUrl,

    sendInput(data) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'input', data }))
      }
    },

    resize(cols, rows) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'resize', cols, rows }))
      }
    },

    close() {
      closedByUser = true
      socket.close()
    },

    getReadyState() {
      return socket.readyState
    },
  }
}
