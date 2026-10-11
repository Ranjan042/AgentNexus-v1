import ContextMenu from '../../../shared/components/ContextMenu'

export default function FileContextMenu({ x, y, node, onClose, onDelete, onRename }) {
  const items = [
    {
      id: 'rename',
      label: 'Rename',
      onSelect: onRename,
    },
  ]

  if (node.type === 'file') {
    items.push({
      id: 'delete',
      label: 'Delete',
      onSelect: onDelete,
    })
  }

  return <ContextMenu x={x} y={y} items={items} onClose={onClose} />
}
