import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import KeywordForm from '@/components/keywords/KeywordForm'
import KeywordManager from '@/components/keywords/KeywordManager'
import { Info } from 'lucide-react'

export default function KeywordsPage() {
  const { fetchKeywords, keywords } = useAppStore()

  useEffect(() => {
    fetchKeywords()
  }, [])

  const counts = {
    positive: keywords.filter((k) => k.category === 'positive').length,
    negative: keywords.filter((k) => k.category === 'negative').length,
    neutral: keywords.filter((k) => k.category === 'neutral').length,
    spam: keywords.filter((k) => k.category === 'spam').length,
  }

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: form + info */}
        <div className="lg:col-span-1 space-y-4">
          <KeywordForm />

          {/* Category stats */}
          <div className="card p-4 space-y-2.5">
            <p className="section-label">Databank Summary</p>
            {[
              { label: 'Positive', count: counts.positive, color: 'bg-verdant-400' },
              { label: 'Negative', count: counts.negative, color: 'bg-crimson-400' },
              { label: 'Neutral', count: counts.neutral, color: 'bg-ink-400' },
              { label: 'Spam/Toxic', count: counts.spam, color: 'bg-amber-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs font-medium text-ink-600">{item.label}</span>
                </div>
                <span className="text-xs font-bold text-ink-700 font-mono">{item.count}</span>
              </div>
            ))}
            <div className="border-t border-ink-100 pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-500">Total keywords</span>
              <span className="text-xs font-bold text-ink-900 font-mono">{keywords.length}</span>
            </div>
          </div>

          {/* Tips */}
          <div className="card p-4 bg-azure-50 border-azure-200">
            <div className="flex items-start gap-2">
              <Info size={13} className="text-azure-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-azure-800 mb-1.5">Tips for best results</p>
                <ul className="space-y-1.5">
                  {[
                    'Use lowercase words — matching is case-insensitive.',
                    'Higher weight (8–10) for strong signals like "fraud" or "love".',
                    'Mark spam patterns with the Spam/Toxic category to detect fake reviews.',
                    'Industry-specific terms improve accuracy over the AFINN baseline.',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-azure-400 flex-shrink-0 mt-1.5" />
                      <span className="text-[11px] text-azure-700 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Main: keyword list */}
        <div className="lg:col-span-3">
          <KeywordManager />
        </div>
      </div>
    </div>
  )
}