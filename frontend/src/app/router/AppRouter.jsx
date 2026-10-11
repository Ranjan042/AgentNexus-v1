import {Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from '../../pages/LandingPage'
import WorkspacePage from '../../pages/WorkspacePage'
import WorkspaceEditorPage from '../../pages/WorkspaceEditorPage'
import WorkspacePreviewPage from '../../pages/WorkspacePreviewPage'
import SettingsPage from '../../pages/SettingsPage'
import NotFoundPage from '../../pages/NotFoundPage'

export default function AppRouter() {
  return (  
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace/:sandboxId" element={<WorkspacePage />} />
        <Route path="/workspace/:sandboxId/editor" element={<WorkspaceEditorPage />} />
        <Route path="/workspace/:sandboxId/preview" element={<WorkspacePreviewPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  )
}
