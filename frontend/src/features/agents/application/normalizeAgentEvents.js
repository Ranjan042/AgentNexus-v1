import { createId } from '../../../shared/utils/id'

function asArray(value) {
  if (Array.isArray(value)) {
    return value
  }
  if (value == null) {
    return []
  }
  return [value]
}


function unwrapLangChain(value) {
  if (!value || typeof value !== 'object') {
    return value
  }

  if (value.kwargs) {
    return {
      ...value.kwargs,
      id: value.kwargs.id || value.id,
      type: value.id?.[value.id.length - 1] || value.kwargs.type,
    }
  }

  return value
}

function extractText(content) {
  if (typeof content === 'string') {
    return content
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part
        }
        return part?.text || part?.content || ''
      })
      .filter(Boolean)
      .join('\n')
  }
  if (content && typeof content === 'object') {
    return content.text || content.content || JSON.stringify(content)
  }
  return ''
}

export function normalizeProgress(payload) {
  const data = payload?.data ?? payload
  const nodeEntries = data && typeof data === 'object' ? Object.entries(data) : []
  const [nodeName, nodeState] = nodeEntries[0] || []
  const state = nodeState && typeof nodeState === 'object' ? nodeState : data || {}

  return {
    id: createId('progress'),
    agent: state.currentAgent || nodeName || 'agent',
    nextAgent: state.nextAgent || null,
    task: state.agentTask || state.agentResult?.agentTask || '',
    result: state.agentResult || state.agentResults || null,
    timestamp: Date.now(),
    raw: data,
  }
}

export function normalizeMessages(payload) {
  const data = payload?.data ?? payload
  const items = asArray(data)
  const messages = []
  const toolCalls = []

  items.forEach((item) => {
    const source = Array.isArray(item) ? item[0] : item
    const message = unwrapLangChain(source)
    if (!message || typeof message !== 'object') {
      if (message) {
        messages.push({
          id: createId('msg'),
          type: 'message',
          role: 'assistant',
          content: String(message),
          timestamp: Date.now(),
        })
      }
      return
    }

    const typeName = String(message.type || message.role || '').toLowerCase()
    const toolCallList = message.tool_calls || message.toolCalls || message.tool_call_chunks || []

    asArray(toolCallList).forEach((call) => {
      const name = call.name || call.tool || 'tool'
      toolCalls.push({
        id: call.id || createId('tool'),
        type: 'tool_call',
        tool: name,
        status: 'running',
        input: call.args || call.input || {},
        output: null,
        timestamp: Date.now(),
      })
    })

    if (typeName.includes('tool')) {
      toolCalls.push({
        id: message.tool_call_id || message.id || createId('tool'),
        type: 'tool_call',
        tool: message.name || message.tool || 'tool',
        status: 'completed',
        input: {},
        output: extractText(message.content),
        timestamp: Date.now(),
      })
      return
    }

    const content = extractText(message.content)
    if (content) {
      messages.push({
        id: message.id || createId('msg'),
        type: typeName.includes('ai') ? 'assistant' : message.role || 'assistant',
        role: message.role || 'assistant',
        content,
        timestamp: Date.now(),
      })
    }
  })

  return { messages, toolCalls }
}

export function normalizeCustom(payload) {
  const data = payload?.data ?? payload
  return {
    id: createId('custom'),
    type: 'custom',
    content: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    timestamp: Date.now(),
  }
}
