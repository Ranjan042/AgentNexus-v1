import FileTreeNode from './FileTreeNode'

export default function FileTree(props) {
  const { tree } = props

  if (!tree?.length) {
    return <div className="px-3 py-2 text-xs text-[var(--muted)]">No files yet</div>
  }

  return (
    <div className="file-tree">
      {tree.map((node) => (
        <FileTreeNode key={node.path} node={node} depth={0} {...props} />
      ))}
    </div>
  )
}
