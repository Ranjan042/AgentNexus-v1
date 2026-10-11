import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  Image,
} from 'lucide-react'
import { getFileExtension } from '../../../shared/utils/language'

function FileIcon({ name, type, open }) {
  if (type === 'folder') {
    return open ? <FolderOpen size={14} /> : <Folder size={14} />
  }
  const ext = getFileExtension(name)
  if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext)) {
    return <Image size={14} />
  }
  if (ext === 'json') {
    return <FileJson size={14} />
  }
  if (['js', 'jsx', 'ts', 'tsx', 'css', 'html', 'py'].includes(ext)) {
    return <FileCode size={14} />
  }
  return <FileText size={14} />
}

export default function FileTreeNode({
  node,
  depth,
  expandedFolders,
  selectedFile,
  onToggle,
  onOpen,
  onContextMenu,
  onDragStart,
  onDrop,
}) {
  const expanded = expandedFolders.includes(node.path)
  const active = selectedFile === node.path

  return (
    <div>
      <button
        type="button"
        className={`tree-node ${active ? 'active' : ''}`}
        style={{ paddingLeft: 8 + depth * 12 }}
        draggable={node.type === 'file'}
        onClick={() => (node.type === 'folder' ? onToggle(node.path) : onOpen(node.path))}
        onContextMenu={(event) => onContextMenu(event, node)}
        onDragStart={(event) => onDragStart(event, node)}
        onDragOver={(event) => {
          if (node.type === 'folder') {
            event.preventDefault()
          }
        }}
        onDrop={(event) => onDrop(event, node)}
      >
        {node.type === 'folder' ? (
          expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
        ) : (
          <span className="w-3" />
        )}
        <FileIcon name={node.name} type={node.type} open={expanded} />
        <span className="name">{node.name}</span>
      </button>
      {node.type === 'folder' && expanded
        ? node.children?.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              selectedFile={selectedFile}
              onToggle={onToggle}
              onOpen={onOpen}
              onContextMenu={onContextMenu}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          ))
        : null}
    </div>
  )
}
