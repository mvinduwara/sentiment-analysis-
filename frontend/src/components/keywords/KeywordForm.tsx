import { useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { KeywordCategory } from '@/types'
import { clsx } from 'clsx'

const CATEGORIES: { value: KeywordCategory; label: string; desc: string; color: string }[] = [
  { value: 'positive', label: 'Positive', desc: 'Good, great, excellent…', color: 'border-verdant-300 bg-verdant-50 text-verdant-700' },
  { value: 'negative', label: 'Negative', desc: 'Bad, terrible, broken…', color: 'border-crimson-300 bg-crimson-50 text-crimson-700' },
  { value: 'neutral', label: 'Neutral', desc: 'Okay, average, fair…', color: 'border-ink-300 bg-ink-50 text-ink-600' },
  { value: 'spam', label: 'Spam/Toxic', desc: 'AMAZING!!! BEST EVER!!!', color: 'border-amber-300 bg-amber-50 text-amber-700' },
]

export default function KeywordForm() {
  const { addKeyword } = useAppStore()
  const [word, setWord] = useState('')
  const [category, setCategory] = useState<KeywordCategory>('positive')
  const [weight, setWeight] = useState(5)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim()) return
    setLoading(true)
    await addKeyword(word.trim().toLowerCase(), category, weight)
    setWord('')
    setWeight(5)
    setLoading(false)
  }

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={15} className="text-verdant-500" />
        <h3 className="text-sm font-semibold text-ink-800">Add Keyword to Databank</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Word input */}
        <div>
          <label className="section-label block mb-1.5">Keyword / Phrase</label>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value.toLowerCase())}
            placeholder="e.g. excellent, waste of money, !!!…"
            className="input-field"
            maxLength={64}
          />
        </div>

        {/* Category */}
        <div>
          <label className="section-label block mb-2">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={clsx(
                  'px-3 py-2.5 rounded-xl border text-left transition-all',
                  category === cat.value
                    ? `${cat.color} border-2`
                    : 'border-ink-200 bg-white hover:bg-ink-50 text-ink-600'
                )}
              >
                <span className="block text-xs font-semibold">{cat.label}</span>
                <span className="block text-[10px] opacity-70 mt-0.5">{cat.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weight slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="section-label">Weight / Strength</label>
            <span className="text-sm font-bold text-ink-700">{weight}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full h-2 bg-ink-100 rounded-full appearance-none cursor-pointer accent-verdant-500"
          />
          <div className="flex justify-between text-[10px] text-ink-400 mt-1">
            <span>Weak (1)</span>
            <span>Moderate (5)</span>
            <span>Strong (10)</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!word.trim() || loading}
          className="btn-primary w-full justify-center"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          Add to Databank
        </button>
      </form>
    </div>
  )
}