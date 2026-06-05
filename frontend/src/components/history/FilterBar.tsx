import { Search, SlidersHorizontal } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { clsx } from 'clsx'
import type { FilterSentiment } from '@/types'
import { useEffect, useRef, useState } from 'react'

const FILTER_OPTIONS: { value: FilterSentiment; label: string }[] = [
  { value: 'all', label: 'All Reviews' },
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'manipulated', label: '⚠ Flagged' },
]

export default function FilterBar() {
  const { filterSentiment, setFilter, setSearch, sortBy, sortOrder, setSort } = useAppStore()
  const [localSearch, setLocalSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(localSearch)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [localSearch, setSearch])

  return (
    <div className="flex flex-col gap-3">
      {/* Sentiment filter tabs */}
      <div className="flex items-center gap-1 bg-ink-100 p-1 rounded-xl w-fit">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              filterSentiment === opt.value ? 'tab-active' : 'tab-inactive'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search + Sort row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search review text…"
            className="input-field pl-9 text-sm py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-ink-400" />
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
              setSort(sb, so)
            }}
            className="input-field text-xs py-2 w-auto"
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="createdAt-asc">Oldest first</option>
            <option value="score-desc">Highest score</option>
            <option value="score-asc">Lowest score</option>
            <option value="confidence-desc">Most confident</option>
          </select>
        </div>
      </div>
    </div>
  )
}