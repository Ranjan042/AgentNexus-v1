import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RefreshCw, Search } from 'lucide-react'
import FileTree from './FileTree'
import FileContextMenu from './FileContextMenu'
import Spinner from '../../../shared/components/Spinner'
import EmptyState from '../../../shared/components/EmptyState'
import Modal from '../../../shared/components/Modal'
import { filterTree, getDirname, joinPath, movePathIntoFolder, renamePath } from '../../../shared/utils/fileTree'
import { getBasename } from '../../../shared/utils/language'
import {
  selectExpandedFolders,
  selectFileSearchQuery,
  selectFileTree,
  selectFilesError,
  selectFilesLoading,
  selectSelectedFile,
} from '../application/fileSelectors'
import { setFileSearchQuery, toggleFolder } from '../domain/filesSlice'
import { deleteWorkspaceFiles, listWorkspaceFiles, moveWorkspaceFiles } from '../application/fileThunks'
import { openWorkspaceFile } from '../../editor/application/editorThunks'
import IconButton from '../../../shared/components/IconButton'

export default function FileExplorer() {
  const dispatch = useDispatch()
  const tree = useSelector(selectFileTree)
  const loading = useSelector(selectFilesLoading)
  const error = useSelector(selectFilesError)
  const expandedFolders = useSelector(selectExpandedFolders)
  const selectedFile = useSelector(selectSelectedFile)
  const query = useSelector(selectFileSearchQuery)
  const [menu, setMenu] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const visibleTree = useMemo(() => filterTree(tree, query), [tree, query])

  const onContextMenu = (event, node) => {
    event.preventDefault()
    setMenu({ x: event.clientX, y: event.clientY, node })
  }

  const onDragStart = (event, node) => {
    event.dataTransfer.setData('text/plain', node.path)
  }

  const onDrop = (event, node) => {
    event.preventDefault()
    const from = event.dataTransfer.getData('text/plain')
    if (!from || node.type !== 'folder') {
      return
    }
    dispatch(moveWorkspaceFiles([{ from, to: movePathIntoFolder(from, node.path) }]))
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="panel-header">
        <span>Explorer</span>
        <IconButton title="Refresh files" onClick={() => dispatch(listWorkspaceFiles())}>
          <RefreshCw size={14} />
        </IconButton>
      </div>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-2 py-1.5">
        <Search size={12} className="text-[var(--muted)]" />
        <input
          value={query}
          onChange={(event) => dispatch(setFileSearchQuery(event.target.value))}
          placeholder="Filter files"
          className="w-full bg-transparent text-xs text-[var(--text)] outline-none"
        />
      </div>
      {loading ? (
        <div className="p-3">
          <Spinner label="Loading files..." />
        </div>
      ) : null}
      {error ? <div className="px-3 py-2 text-xs text-[var(--error)]">{error}</div> : null}
      {!loading && !tree.length ? (
        <EmptyState title="No files" description="Start a sandbox to load the workspace." />
      ) : (
        <FileTree
          tree={visibleTree}
          expandedFolders={expandedFolders}
          selectedFile={selectedFile}
          onToggle={(path) => dispatch(toggleFolder(path))}
          onOpen={(path) => dispatch(openWorkspaceFile({ path }))}
          onContextMenu={onContextMenu}
          onDragStart={onDragStart}
          onDrop={onDrop}
        />
      )}
      {menu ? (
        <FileContextMenu
          x={menu.x}
          y={menu.y}
          node={menu.node}
          onClose={() => setMenu(null)}
          onDelete={() => setPendingDelete(menu.node)}
          onRename={() => {
            setRenameTarget(menu.node)
            setRenameValue(menu.node.name)
          }}
        />
      ) : null}
      {pendingDelete ? (
        <Modal
          title="Delete file"
          onClose={() => setPendingDelete(null)}
          footer={
            <>
              <button type="button" className="ghost-btn" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  dispatch(deleteWorkspaceFiles([pendingDelete.path]))
                  setPendingDelete(null)
                }}
              >
                Delete
              </button>
            </>
          }
        >
          Delete `{pendingDelete.path}`? This cannot be undone.
        </Modal>
      ) : null}
      {renameTarget ? (
        <Modal
          title="Rename"
          onClose={() => setRenameTarget(null)}
          footer={
            <>
              <button type="button" className="ghost-btn" onClick={() => setRenameTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  const to = renamePath(renameTarget.path, renameValue.trim() || getBasename(renameTarget.path))
                  dispatch(moveWorkspaceFiles([{ from: renameTarget.path, to }]))
                  setRenameTarget(null)
                }}
              >
                Rename
              </button>
            </>
          }
        >
          <input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            className="mt-2 w-full border border-[var(--border)] bg-[var(--editor)] px-2 py-1.5 text-[var(--text)] outline-none"
          />
          <div className="mt-2 text-xs">
            Moves into `{joinPath(getDirname(renameTarget.path), renameValue || renameTarget.name)}`
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
