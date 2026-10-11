import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import IdeLayout from '../shared/components/IdeLayout'
import EditorWorkspace from '../features/editor/presentation/EditorWorkspace'
import { hydrateSandbox } from '../features/sandbox/domain/sandboxSlice'
import { getSandboxPreviewUrl } from '../shared/api/apiConfig'
import { listWorkspaceFiles } from '../features/fileExplorer/application/fileThunks'
import { connectTerminal } from '../features/terminal/application/terminalActions'
import { setPreviewUrl } from '../features/preview/domain/previewSlice'

export default function WorkspacePage({ mode = 'editor' }) {
  const { sandboxId } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!sandboxId) {
      return
    }

    const previewUrl = getSandboxPreviewUrl(sandboxId)
    dispatch(hydrateSandbox({ sandboxId, previewUrl }))
    dispatch(setPreviewUrl(previewUrl))
    dispatch(listWorkspaceFiles(sandboxId))
    dispatch(connectTerminal(sandboxId))
  }, [sandboxId, dispatch])

  return (
    <IdeLayout showPreview={mode === 'preview'}>
      {mode === 'editor' ? <EditorWorkspace /> : null}
    </IdeLayout>
  )
}
