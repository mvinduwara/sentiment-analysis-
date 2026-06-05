import { useAppStore } from '@/store/useAppStore'
import ReviewInput from '@/components/analyzer/ReviewInput'
import AnalysisResultDisplay from '@/components/analyzer/AnalysisResult'
import { ScanText, Info } from 'lucide-react'

export default function AnalyzerPage() {
  const { lastResult, lastReviewText } = useAppStore()

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input column */}
        <div className="lg:col-span-3 space-y-4">
          <ReviewInput />

          {/* How it works */}
          <div className="card p-5 border-ink-100">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-azure-500" />
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest">How it works</p>
            </div>
            <div className="space-y-3">
              {[
                { step: '1', title: 'AFINN-165 Scoring', desc: 'Each word is scored against a 3,382-word lexicon with values from −5 (extremely negative) to +5 (extremely positive).' },
                { step: '2', title: 'Custom Keyword Matching', desc: 'Words in your personal keyword databank are weighted and contribute to the final score, overriding or augmenting the AFINN values.' },
                { step: '3', title: 'Manipulation Detection', desc: 'Pattern analysis checks for excessive punctuation, repetition, spam phrases, incoherence, and other red flags of artificial reviews.' },
                { step: '4', title: 'Confidence Calculation', desc: 'Confidence is derived from keyword density, score extremity, and consistency of signals across the text.' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-ink-900 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink-700">{item.title}</p>
                    <p className="text-xs text-ink-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result column */}
        <div className="lg:col-span-2">
          {lastResult ? (
            <AnalysisResultDisplay result={lastResult} reviewText={lastReviewText} />
          ) : (
            <div className="card border-dashed border-ink-200 p-10 flex flex-col items-center justify-center text-center h-full min-h-[320px]">
              <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mb-3">
                <ScanText size={24} className="text-ink-400" />
              </div>
              <p className="text-sm font-semibold text-ink-500 mb-1">No analysis yet</p>
              <p className="text-xs text-ink-400 max-w-xs leading-relaxed">
                Submit a review on the left to see a full sentiment breakdown with keyword highlights,
                confidence score, and manipulation detection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}