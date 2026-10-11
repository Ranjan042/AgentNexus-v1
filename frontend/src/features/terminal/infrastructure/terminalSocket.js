
import { getTerminalSocketUrl } from '../../../shared/api/apiConfig'

export function createTerminalConnection(sandboxId, handlers = {}) {
  const url = getTerminalSocketUrl(sandboxId)

  const protocol =
    window.location.protocol === 'https:' ? 'wss:' : 'ws:'

  const socketUrl =
    `${protocol}//${window.location.host}${url}`

  console.log('Terminal WebSocket URL:', socketUrl)

  const socket = new WebSocket(socketUrl)
  let closedByUser = false

  socket.addEventListener('open', () => {
    handlers.onOpen?.()
  })

  socket.addEventListener('message', (event) => {
    handlers.onData?.(event.data)
  })

  socket.addEventListener('close', (event) => {
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
