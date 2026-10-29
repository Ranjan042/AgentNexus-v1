import { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { store } from '../store/store'
import ToastContainer from '../../shared/components/ToastContainer'
import CommandPalette from '../../shared/components/CommandPalette'
import QuickOpen from '../../shared/components/QuickOpen'
import { useKeyboardShortcuts } from '../../shared/hooks/useKeyboardShortcuts'
import AuthModal from '../../features/auth/presentation/AuthModal'
import { initializeAuth } from '../../features/auth/application/authThunks'

function AppChrome({ children }) {
  const dispatch = useDispatch()
  useKeyboardShortcuts()

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  return (
    <>
      {children}
      <ToastContainer />
      <CommandPalette />
      <QuickOpen />
      <AuthModal />
    </>
  )
}

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <AppChrome>{children}</AppChrome>
    </Provider>
  )
}
