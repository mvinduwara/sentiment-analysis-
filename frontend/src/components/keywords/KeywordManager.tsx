import { useState } from 'react'
import { Trash2, Edit3, Search, Plus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { Keyword, KeywordCategory } from '@/types'
import { clsx } from 'clsx'

const CATEGORIES: KeywordCategory[] = ['positive', 'negative', 'neutral', 'spam']

const categoryStyle: Record<KeywordCategory, { badge: string; bg: string; text: string; border: string }> = {
  positive: { badge: 'badge-positive', bg: 'bg-verdant-50', text: 'text-verdant-700', border: 'border-verdant-200' },
  negative: { badge: 'badge-negative', bg: 'bg-crimson-50', text: 'text-crimson-700', border: 'border-crimson-200' },
  neutral: { badge: 'badge-neutral', bg: 'bg-ink-50', text: 'text-ink-600', border: 'border-ink-200' },
  spam: { badge: 'badge-warning', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
}

interface EditState {
  id: number
  word: string
  category: KeywordCategory
  weight: number
}

export default function KeywordManager() {
  const { keywords, loadingKeywords, updateKeyword, deleteKeyword } = useAppStore()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<KeywordCategory | 'all'>('all')
  const [editState, setEditState] = useState<EditState | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const filtered = keywords.filter((kw) => {
    const matchCat = activeCategory === 'all' || kw.category === activeCategory
    const matchSearch = search === '' || kw.word.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const grouped: Record<KeywordCategory, Keyword[]> = {
    positive: filtered.filter((k) => k.category === 'positive'),
    negative: filtered.filter((k) => k.category === 'negative'),
    neutral: filtered.filter((k) => k.category === 'neutral'),
    spam: filtered.filter((k) => k.category === 'spam'),
  }

  const handleSaveEdit = async () => {
    if (!editState) return
    await updateKeyword(editState.id, editState.word, editState.category, editState.weight)
    setEditState(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this keyword from the databank?')) return
    setDeletingId(id)
    await deleteKeyword(id)
    setDeletingId(null)
  }

  const displayCategories = (activeCategory === 'all' ? CATEGORIES : [activeCategory]) as KeywordCategory[]

  if (loadingKeywords) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search + Category filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords…"
            className="input-field pl-9 text-sm py-2"
          />
        </div>
        <div className="flex items-center gap-1 bg-ink-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeCategory === 'all' ? 'tab-active' : 'tab-inactive'
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                activeCategory === cat ? 'tab-active' : 'tab-inactive'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-xs text-ink-400 font-medium ml-auto">
          {filtered.length} keyword{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Category groups */}
      {displayCategories.map((cat) => {
        const style = categoryStyle[cat]
        const items = grouped[cat]
        if (activeCategory === 'all' && items.length === 0) return null
        return (
          <div key={cat} className={clsx('card overflow-hidden border', style.border)}>
            <div className={clsx('px-4 py-3 border-b flex items-center justify-between', style.bg, style.border)}>
              <div className="flex items-center gap-2">
                <span className={style.badge}>{cat}</span>
                <span className={clsx('text-xs font-medium', style.text)}>
                  {items.length} keyword{items.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-6 text-center text-ink-400 text-xs">
                No {cat} keywords yet — add some above
              </div>
            ) : (
              <div className="divide-y divide-ink-50">
                {items.map((kw) => (
                  <div key={kw.id} className="flex items-center gap-3 px-4 py-3 hover:bg-ink-50/60 transition-colors">
                    {editState?.id === kw.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editState.word}
                          onChange={(e) => setEditState({ ...editState, word: e.target.value })}
                          className="input-field py-1.5 text-sm w-36"
                          autoFocus
                        />
                        <select
                          value={editState.category}
                          onChange={(e) => setEditState({ ...editState, category: e.target.value as KeywordCategory })}
                          className="input-field py-1.5 text-sm w-auto"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={editState.weight}
                          onChange={(e) => setEditState({ ...editState, weight: Number(e.target.value) })}
                          className="input-field py-1.5 text-sm w-16 text-center"
                        />
                        <button onClick={handleSaveEdit} className="btn-primary text-xs py-1.5 px-3">Save</button>
                        <button onClick={() => setEditState(null)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium text-ink-800 font-mono">{kw.word}</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center gap-1"
                            title={`Weight: ${kw.weight}/10`}
                          >
                            {Array.from({ length: 10 }).map((_, i) => (
                              <span
                                key={i}
                                className={clsx(
                                  'w-1.5 h-3 rounded-sm transition-all',
                                  i < kw.weight ? style.bg.replace('bg-', 'bg-').concat(' border ').concat(style.border) : 'bg-ink-100'
                                )}
                                style={i < kw.weight ? {
                                  backgroundColor: cat === 'positive' ? '#a1e8c3' :
                                    cat === 'negative' ? '#f4a8a8' :
                                      cat === 'spam' ? '#f5d98a' : '#cdc9bf'
                                } : {}}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-ink-400 font-medium w-14 text-right">
                            weight {kw.weight}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => setEditState({ id: kw.id, word: kw.word, category: kw.category, weight: kw.weight })}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:bg-azure-50 hover:text-azure-600 transition-colors"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(kw.id)}
                            disabled={deletingId === kw.id}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:bg-crimson-50 hover:text-crimson-600 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Plus size={24} className="text-ink-300 mx-auto mb-2" />
          <p className="text-ink-400 text-sm font-medium">No keywords found</p>
          <p className="text-ink-300 text-xs mt-1">Add your first keyword using the form above</p>
        </div>
      )}
    </div>
  )
}