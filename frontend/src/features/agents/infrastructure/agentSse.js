import { API_BASE_URL } from '../../../shared/api/apiConfig'
import { parseResponseError } from '../../../shared/api/errorHandler'

function parseSseBlock(block) {
  let event = 'message'
  const dataLines = []

  block.split('\n').forEach((line) => {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  })

  if (dataLines.length === 0) {
    return null
  }

  const raw = dataLines.join('\n')
  let payload = raw
  try {
    payload = JSON.parse(raw)
  } catch {
    payload = raw
  }

  return { event, data: payload, raw }
}

export async function runAgentSse({ task, sandboxId, onEvent, signal }) {
  const response = await fetch(`${API_BASE_URL}/agents/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ task, sandboxId }),
    signal,
  })

  if (!response.ok) {
    throw await parseResponseError(response, 'Failed to start agent')
  }

  if (!response.body) {
    throw new Error('Agent stream is not available')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      const parsed = parseSseBlock(part.trim())
      if (parsed) {
        onEvent(parsed)
      }
    }
  }

  if (buffer.trim()) {
    const parsed = parseSseBlock(buffer.trim())
    if (parsed) {
      onEvent(parsed)
    }
  }
}
