import { LANGUAGE_BY_EXTENSION } from '../constants/languages'

export function getFileExtension(filename = '') {
  const name = filename.split('/').pop() || ''

  if (name.toLowerCase() === 'dockerfile') {
    return 'dockerfile'
  }

  if (name.startsWith('.') && !name.slice(1).includes('.')) {
    return name.slice(1).toLowerCase()
  }

  const parts = name.split('.')
  if (parts.length < 2) {
    return ''
  }

  return parts.pop().toLowerCase()
}

export function getLanguageFromFilename(filename = '') {
  const extension = getFileExtension(filename)
  return LANGUAGE_BY_EXTENSION[extension] || 'plaintext'
}

export function getBasename(path = '') {
  return path.split('/').filter(Boolean).pop() || path
}

export function getDirname(path = '') {
  const parts = path.split('/').filter(Boolean)
  parts.pop()
  return parts.join('/')
}

export function joinPath(...parts) {
  return parts
    .flatMap((part) => String(part || '').split('/'))
    .filter(Boolean)
    .join('/')
}
