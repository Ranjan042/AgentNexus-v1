import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, CircleAlert, TriangleAlert } from 'lucide-react'
import { dismissToast } from '../../features/ui/domain/uiSlice'
import { selectToasts } from '../../features/ui/application/uiSelectors'

const ICONS = {
  success: Check,
  error: CircleAlert,
  warning: TriangleAlert,
}

export default function ToastContainer() {
  const toasts = useSelector(selectToasts)
  const dispatch = useDispatch()

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => dispatch(dismissToast(toast.id)), 3200),
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, dispatch])

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Check
        return (
          <div key={toast.id} className={`toast ${toast.type || ''}`}>
            <Icon size={14} />
            <span>{toast.message}</span>
          </div>
        )
      })}
    </div>
  )
}
