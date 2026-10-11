import { Provider } from 'react-redux'
import { store } from '../store/store'
import ToastContainer from '../../shared/components/ToastContainer'
import CommandPalette from '../../shared/components/CommandPalette'
import QuickOpen from '../../shared/components/QuickOpen'
import { useKeyboardShortcuts } from '../../shared/hooks/useKeyboardShortcuts'

function AppChrome({ children }) {
  useKeyboardShortcuts()
  return (
    <>
      {children}
      <ToastContainer />
      <CommandPalette />
      <QuickOpen />
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
