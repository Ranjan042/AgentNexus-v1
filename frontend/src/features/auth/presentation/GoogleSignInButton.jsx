import { useState } from 'react'
import { loginWithGoogle } from '../application/authThunks'

/**
 * Official Google 'G' Logo SVG conforming strictly to Google Identity Services branding guidelines.
 */
export function GoogleLogo({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

/**
 * Google Sign-In Button compliant with Google Identity Services Brand Guidelines:
 * - Proper SVG geometry & Google color standards
 * - Roboto / Google Sans typographic hierarchy
 * - Dark & light theme specifications
 * - Accessible states: hover, focus, pressed, disabled
 */
export default function GoogleSignInButton({
  text = 'Sign in with Google',
  theme = 'dark', // 'dark' | 'light' | 'neutral'
  size = 'standard', // 'small' | 'standard' | 'large'
  shape = 'pill', // 'pill' | 'rectangular'
  className = '',
  onClick,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false)

  const handleClick = (e) => {
    if (disabled || loading) return
    setLoading(true)
    if (onClick) {
      onClick(e)
    } else {
      loginWithGoogle()
    }
  }

  // Google Brand Guidelines sizing specs:
  // standard: height 40px, font 14px
  // small: height 32px, font 12px
  // large: height 48px, font 15px
  const sizeClasses = {
    small: 'h-8 px-3 text-xs gap-2',
    standard: 'h-10 px-4 text-sm gap-3',
    large: 'h-12 px-5 text-base gap-3.5',
  }[size] || 'h-10 px-4 text-sm gap-3'

  const shapeClasses =
    shape === 'pill' ? 'rounded-full' : 'rounded-[4px]'

  const themeClasses = {
    dark: 'bg-[#131314] hover:bg-[#1E1F20] text-[#E3E3E3] border border-[#8E918F]/40 hover:border-[#8E918F]/70 shadow-sm active:bg-[#28292A]',
    light: 'bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#1F1F1F] border border-[#747775] hover:border-[#5F6368] shadow-sm active:bg-[#F1F3F4]',
    neutral: 'bg-[var(--panel-2)] hover:bg-[var(--glass)] text-[var(--text)] border border-[var(--border)] shadow-sm active:opacity-90',
  }[theme] || 'bg-[#131314] hover:bg-[#1E1F20] text-[#E3E3E3] border border-[#8E918F]/40'

  const logoSizes = {
    small: 16,
    standard: 18,
    large: 20,
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      role="button"
      aria-label={text}
      className={`inline-flex items-center justify-center font-medium font-['Google_Sans',Roboto,sans-serif] transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${shapeClasses} ${sizeClasses} ${themeClasses} ${className}`}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <GoogleLogo size={logoSizes[size] || 18} />
      )}
      <span className="tracking-wide">{loading ? 'Connecting...' : text}</span>
    </button>
  )
}
