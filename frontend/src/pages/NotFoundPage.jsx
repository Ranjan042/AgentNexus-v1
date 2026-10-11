import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="grid h-full place-items-center bg-[var(--canvas)]">
      <div className="island p-8 text-center">
        <div className="text-lg">Page not found</div>
        <Link to="/" className="mt-3 inline-block text-sm text-[var(--primary)]">
          Return home
        </Link>
      </div>
    </div>
  )
}
