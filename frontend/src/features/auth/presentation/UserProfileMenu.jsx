import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LogOut, Settings, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { selectCurrentUser } from '../application/authSelectors'
import { logoutUser } from '../application/authThunks'

/**
 * Google Account Profile Chip and Dropdown Menu conforming to Google Material Design 3 rules.
 */
export default function UserProfileMenu() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!user) return null

  const handleLogout = async () => {
    setIsOpen(false)
    await dispatch(logoutUser())
  }

  const userInitial = (user.name || user.email || 'U').charAt(0).toUpperCase()

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Google Account Profile Button / Chip */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 rounded-full border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--panel-2)] hover:bg-[var(--glass)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        title={user.email}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'User avatar'}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-[#121216] font-semibold text-xs flex items-center justify-center">
            {userInitial}
          </div>
        )}
        <span className="text-xs font-medium max-w-[100px] truncate pr-2 hidden md:inline text-[var(--text)]">
          {user.name?.split(' ')[0] || 'Account'}
        </span>
      </button>

      {/* Google Account Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[var(--panel)] border border-[var(--border)] shadow-[var(--shadow)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Profile Section */}
          <div className="p-4 text-center border-b border-[var(--border)] bg-[var(--panel-2)]/60">
            <div className="relative mx-auto w-16 h-16 mb-2">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-[var(--primary)]/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--primary)] text-[#121216] font-bold text-xl flex items-center justify-center mx-auto">
                  {userInitial}
                </div>
              )}
            </div>

            <div className="font-medium text-sm text-[var(--text)] truncate">
              {user.name}
            </div>
            <div className="text-xs text-[var(--muted)] truncate mb-2">
              {user.email}
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              <Shield size={10} />
              Google Verified
            </span>
          </div>

          {/* Navigation Links */}
          <div className="py-2 px-1 text-xs">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--text)] hover:bg-[var(--glass)] transition-colors"
            >
              <Settings size={15} className="text-[var(--muted)]" />
              Settings & Preferences
            </Link>
          </div>

          {/* Sign Out Button (Google M3 styled) */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--panel)]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-[var(--border)] hover:border-[var(--error)]/50 hover:bg-[var(--error)]/10 text-xs font-medium text-[var(--text)] hover:text-[var(--error)] transition-colors"
            >
              <LogOut size={14} />
              Sign out of AgentNexus
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
