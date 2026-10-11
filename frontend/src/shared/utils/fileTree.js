import { getBasename, getDirname, joinPath } from './language'

function sortNodes(nodes) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })

  nodes.forEach((node) => {
    if (node.children) {
      sortNodes(node.children)
    }
  })
}

export function flatFilesToTree(paths = []) {
  const root = []
  const folders = new Map([['', { children: root }]])

  const normalized = [...new Set(paths)]
    .map((path) => String(path).replace(/\\/g, '/').replace(/^\.\//, ''))
    .filter(Boolean)
    .sort()

  for (const filePath of normalized) {
    const parts = filePath.split('/').filter(Boolean)
    let parentKey = ''

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1
      const key = parentKey ? `${parentKey}/${part}` : part
      const parent = folders.get(parentKey)

      if (isFile) {
        if (!parent.children.some((child) => child.path === key && child.type === 'file')) {
          parent.children.push({
            id: key,
            name: part,
            path: key,
            type: 'file',
          })
        }
        return
      }

      if (!folders.has(key)) {
        const folder = {
          id: key,
          name: part,
          path: key,
          type: 'folder',
          children: [],
        }
        folders.set(key, folder)
        parent.children.push(folder)
      }

      parentKey = key
    })
  }

  sortNodes(root)
  return root
}

export function findFileInTree(nodes = [], path) {
  for (const node of nodes) {
    if (node.path === path) {
      return node
    }
    if (node.children) {
      const match = findFileInTree(node.children, path)
      if (match) {
        return match
      }
    }
  }
  return null
}

export function removeFileFromTree(nodes = [], path) {
  return nodes
    .filter((node) => node.path !== path)
    .map((node) => {
      if (!node.children) {
        return node
      }
      return {
        ...node,
        children: removeFileFromTree(node.children, path),
      }
    })
    .filter((node) => node.type !== 'folder' || (node.children && node.children.length > 0))
}

export function moveFileInTree(nodes = [], from, to) {
  const flattened = flattenTree(nodes).filter((path) => path !== from)
  flattened.push(to)
  return flatFilesToTree(flattened)
}

export function flattenTree(nodes = []) {
  const files = []

  const walk = (list) => {
    list.forEach((node) => {
      if (node.type === 'file') {
        files.push(node.path)
      }
      if (node.children) {
        walk(node.children)
      }
    })
  }

  walk(nodes)
  return files
}

export function filterTree(nodes = [], query = '') {
  const term = query.trim().toLowerCase()
  if (!term) {
    return nodes
  }

  const filterNodes = (list) =>
    list
      .map((node) => {
        if (node.type === 'folder') {
          const children = filterNodes(node.children || [])
          if (children.length > 0 || node.name.toLowerCase().includes(term)) {
            return { ...node, children }
          }
          return null
        }

        return node.name.toLowerCase().includes(term) || node.path.toLowerCase().includes(term)
          ? node
          : null
      })
      .filter(Boolean)

  return filterNodes(nodes)
}

export function collectFolderPaths(nodes = []) {
  const folders = []

  const walk = (list) => {
    list.forEach((node) => {
      if (node.type === 'folder') {
        folders.push(node.path)
        walk(node.children || [])
      }
    })
  }

  walk(nodes)
  return folders
}

export function renamePath(path, nextName) {
  const dir = getDirname(path)
  return dir ? joinPath(dir, nextName) : nextName
}

export function movePathIntoFolder(from, folderPath) {
  return joinPath(folderPath, getBasename(from))
}

export { getBasename, getDirname, joinPath }
