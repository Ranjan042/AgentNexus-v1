import { useRef } from 'react'

export default function ResizableSplit({
  orientation = 'vertical',
  onResize,
  onResizeEnd,
  onResizeStart,
}) {
  const dragging = useRef(false)

  const onPointerDown = (event) => {
    event.preventDefault()
    dragging.current = true
    onResizeStart?.()
    event.currentTarget.classList.add('active')
    event.currentTarget.setPointerCapture(event.pointerId)

    const startX = event.clientX
    const startY = event.clientY
    const target = event.currentTarget

    const move = (moveEvent) => {
      if (!dragging.current) {
        return
      }
      onResize({
        dx: moveEvent.clientX - startX,
        dy: moveEvent.clientY - startY,
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      })
    }

    const up = () => {
      dragging.current = false
      target.classList.remove('active')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      onResizeEnd?.()
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div
      className={`split-handle ${orientation}`}
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation={orientation === 'vertical' ? 'vertical' : 'horizontal'}
    />
  )
}
