import {
  Brain,
  Search,
  Code2,
  Bug,
  ShieldCheck,
  Cpu,
  Terminal,
  FileText,
  FileEdit,
  FolderTree,
  Trash2,
  Globe,
  Wrench,
} from 'lucide-react'

export const AGENT_ROLES = {
  supervisor: {
    key: 'supervisor',
    label: 'Supervisor',
    badge: 'Orchestrator',
    description: 'Planning & coordinating sub-agents',
    Icon: Brain,
    color: '#818cf8',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/30',
    bgClass: 'bg-indigo-500/10',
    pillClass: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
    dotClass: 'bg-indigo-400',
  },
  research: {
    key: 'research',
    label: 'Research',
    badge: 'Explorer',
    description: 'Investigating files, patterns & context',
    Icon: Search,
    color: '#38bdf8',
    textClass: 'text-sky-400',
    borderClass: 'border-sky-500/30',
    bgClass: 'bg-sky-500/10',
    pillClass: 'bg-sky-500/20 text-sky-200 border-sky-500/30',
    dotClass: 'bg-sky-400',
  },
  code: {
    key: 'code',
    label: 'Code',
    badge: 'Builder',
    description: 'Writing, updating & refactoring files',
    Icon: Code2,
    color: '#34d399',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-emerald-500/10',
    pillClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
  debug: {
    key: 'debug',
    label: 'Debug',
    badge: 'Fixer',
    description: 'Diagnosing errors & repairing code',
    Icon: Bug,
    color: '#fbbf24',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-500/10',
    pillClass: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    dotClass: 'bg-amber-400',
  },
  review: {
    key: 'review',
    label: 'Review',
    badge: 'Auditor',
    description: 'Verifying code quality & completeness',
    Icon: ShieldCheck,
    color: '#f472b6',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
    bgClass: 'bg-rose-500/10',
    pillClass: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
    dotClass: 'bg-rose-400',
  },
  system: {
    key: 'system',
    label: 'System',
    badge: 'System',
    description: 'Agent lifecycle & runtime orchestrator',
    Icon: Cpu,
    color: '#94a3b8',
    textClass: 'text-zinc-400',
    borderClass: 'border-zinc-500/30',
    bgClass: 'bg-zinc-500/10',
    pillClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
    dotClass: 'bg-zinc-400',
  },
}

export function getAgentMeta(roleName) {
  const key = String(roleName || 'system').toLowerCase()
  return AGENT_ROLES[key] || {
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    badge: 'Agent',
    description: 'Autonomous worker',
    Icon: Cpu,
    color: '#94a3b8',
    textClass: 'text-zinc-400',
    borderClass: 'border-zinc-500/30',
    bgClass: 'bg-zinc-500/10',
    pillClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
    dotClass: 'bg-zinc-400',
  }
}

export function getToolMeta(toolName = '') {
  const name = String(toolName || '').toLowerCase()

  if (name.includes('command') || name.includes('terminal') || name.includes('exec') || name.includes('shell')) {
    return {
      category: 'terminal',
      label: 'Terminal Exec',
      Icon: Terminal,
      badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      dotClass: 'bg-purple-400',
    }
  }

  if (name.includes('search_internet') || name.includes('web') || name.includes('fetch')) {
    return {
      category: 'web',
      label: 'Web Search',
      Icon: Globe,
      badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      dotClass: 'bg-blue-400',
    }
  }

  if (name.includes('search_files') || name.includes('find_file') || name.includes('grep')) {
    return {
      category: 'search',
      label: 'File Search',
      Icon: Search,
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      dotClass: 'bg-cyan-400',
    }
  }

  if (name.includes('read')) {
    return {
      category: 'file_read',
      label: 'Read File',
      Icon: FileText,
      badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      dotClass: 'bg-sky-400',
    }
  }

  if (name.includes('update') || name.includes('write') || name.includes('create')) {
    return {
      category: 'file_write',
      label: 'Write File',
      Icon: FileEdit,
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dotClass: 'bg-emerald-400',
    }
  }

  if (name.includes('delete') || name.includes('remove')) {
    return {
      category: 'file_delete',
      label: 'Delete File',
      Icon: Trash2,
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dotClass: 'bg-rose-400',
    }
  }

  if (name.includes('list')) {
    return {
      category: 'file_list',
      label: 'List Files',
      Icon: FolderTree,
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dotClass: 'bg-amber-400',
    }
  }

  return {
    category: 'generic',
    label: toolName || 'Tool',
    Icon: Wrench,
    badgeClass: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
    dotClass: 'bg-zinc-400',
  }
}

export function extractToolTarget(_toolName, input) {
  if (!input || typeof input !== 'object') {
    return null
  }

  if (input.command) {
    return input.command
  }
  if (input.query) {
    return `"${input.query}"`
  }
  if (input.path) {
    return input.path
  }
  if (input.files) {
    if (Array.isArray(input.files)) {
      if (input.files.length === 0) return null
      const first = input.files[0]
      const path = typeof first === 'string' ? first : first?.path || first?.file
      if (path) {
        return input.files.length > 1 ? `${path} (+${input.files.length - 1} more)` : path
      }
    } else if (typeof input.files === 'string') {
      return input.files
    }
  }
  if (input.file) {
    return input.file
  }
  if (input.target) {
    return input.target
  }

  return null
}

export function formatDuration(ms) {
  if (!ms || ms < 0) return null
  if (ms < 1000) return `${Math.round(ms)}ms`
  const sec = (ms / 1000).toFixed(1)
  if (sec < 60) return `${sec}s`
  const minutes = Math.floor(sec / 60)
  const remainingSec = Math.round(sec % 60)
  return `${minutes}m ${remainingSec}s`
}

export function formatTimestamp(value) {
  if (!value) return ''
  try {
    const date = new Date(value)
    return date.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}
