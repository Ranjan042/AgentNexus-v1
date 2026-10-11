export default function IconButton({
  children,
  title,
  onClick,
  active = false,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`icon-btn ${active ? 'active' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
