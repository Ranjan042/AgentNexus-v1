import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search } from 'lucide-react'
import Spinner from '../../../shared/components/Spinner'
import { searchWorkspaceFiles } from '../application/fileThunks'
import {
  selectFileSearchError,
  selectFileSearchLoading,
  selectFileSearchResults,
} from '../application/fileSelectors'
import { openWorkspaceFile } from '../../editor/application/editorThunks'

export default function FileSearchPanel() {
  const dispatch = useDispatch()
  const [query, setQuery] = useState('')
  const [path, setPath] = useState('src')
  const loading = useSelector(selectFileSearchLoading)
  const error = useSelector(selectFileSearchError)
  const results = useSelector(selectFileSearchResults)

  const grouped = useMemo(() => {
    const map = new Map()
    ;(results.matches || []).forEach((match) => {
      const filePath = match.path || match.file
      if (!map.has(filePath)) {
        map.set(filePath, [])
      }
      map.get(filePath).push(match)
    })
    return [...map.entries()]
  }, [results.matches])

  const runSearch = (event) => {
    event.preventDefault()
    if (!query.trim()) {
      return
    }
    dispatch(searchWorkspaceFiles({ query, path: path.replace(/^\/+/, '') }))
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="panel-header">Search</div>
      <form onSubmit={runSearch} className="border-b border-[var(--border)] p-2">
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--editor)] px-2 py-1">
          <Search size={12} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workspace"
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>
        <input
          value={path}
          onChange={(event) => setPath(event.target.value)}
          placeholder="Path (optional)"
          className="w-full bg-transparent text-xs text-[var(--muted)] outline-none"
        />
      </form>
      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="p-3">
            <Spinner label="Searching..." />
          </div>
        ) : null}
        {error ? <div className="px-3 py-2 text-xs text-[var(--error)]">{error}</div> : null}
        {grouped.map(([filePath, matches]) => (
          <div key={filePath} className="mb-2">
            <div className="px-3 py-1 text-xs text-[var(--primary)]">{filePath}</div>
            {matches.map((match, index) => (
              <button
                key={`${filePath}-${match.line}-${index}`}
                type="button"
                className="search-hit"
                onClick={() => dispatch(openWorkspaceFile({ path: filePath, line: match.line }))}
              >
                <div className="font-mono text-[11px] text-[var(--muted)]">
                  {match.line}: {match.text}
                </div>
              </button>
            ))}
          </div>
        ))}
        {!loading && query && !grouped.length ? (
          <div className="p-3 text-xs text-[var(--muted)]">No matches</div>
        ) : null}
      </div>
    </div>
  )
}
