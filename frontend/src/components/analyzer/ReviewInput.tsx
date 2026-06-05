import { useState, useRef } from 'react'
import { Send, Sparkles, RotateCcw, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { clsx } from 'clsx'

const EXAMPLE_REVIEWS = [
  {
    label: 'Happy customer',
    text: 'Absolutely fantastic product! The quality is exceptional and delivery was super fast. I am genuinely impressed and would highly recommend this to everyone I know.',
  },
  {
    label: 'Suspicious positive',
    text: 'AMAZING AMAZING AMAZING!!! Best product EVER!!!! 10/10 would buy!!! Everyone should buy this right now!! Perfect perfect perfect!!! I love it so much!!!',
  },
  {
    label: 'Dissatisfied customer',
    text: 'Terrible experience. The product broke after two days and customer support was completely useless and rude. Total waste of money.',
  },
  {
    label: 'Mixed review',
    text: 'The product itself is decent but the packaging was damaged. Customer service was helpful when I reported the issue, though it took a while to resolve.',
  },
]

const SOURCE_OPTIONS = ['', 'Google Reviews', 'Trustpilot', 'Yelp', 'Amazon', 'App Store', 'Twitter/X', 'Facebook', 'Other']

export default function ReviewInput() {
  const { analyzeReview, analyzing, clearResult } = useAppStore()
  const [text, setText] = useState('')
  const [source, setSource] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const maxChars = 2000
  const remaining = maxChars - text.length

  const handleSubmit = async () => {
    if (!text.trim() || analyzing) return
    await analyzeReview(text.trim(), source || undefined)
  }

  const handleExample = (exampleText: string) => {
    setText(exampleText)
    setShowExamples(false)
    clearResult()
    textareaRef.current?.focus()
  }

  const handleClear = () => {
    setText('')
    setSource('')
    clearResult()
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="card-elevated p-6 animate-in" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-verdant-500" />
            <h2 className="text-base font-semibold text-ink-800">Sentiment Analysis Input</h2>
          </div>
          <p className="text-xs text-ink-400">
            Paste a customer review, testimonial, or any text. Press{' '}
            <kbd className="px-1.5 py-0.5 bg-ink-100 rounded text-ink-600 font-mono text-[10px]">⌘↵</kbd>{' '}
            to analyze.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Examples dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="btn-secondary text-xs px-3 py-2"
            >
              Examples
              <ChevronDown
                size={12}
                className={clsx('transition-transform', showExamples && 'rotate-180')}
              />
            </button>
            {showExamples && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-ink-100 rounded-xl shadow-lg z-20 overflow-hidden">
                {EXAMPLE_REVIEWS.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => handleExample(ex.text)}
                    className="w-full text-left px-4 py-3 text-xs text-ink-700 hover:bg-ink-50 border-b border-ink-50 last:border-0 transition-colors"
                  >
                    <span className="font-semibold block mb-0.5">{ex.label}</span>
                    <span className="text-ink-400 line-clamp-1">{ex.text.slice(0, 60)}…</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {text && (
            <button onClick={handleClear} className="btn-secondary text-xs px-3 py-2">
              <RotateCcw size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxChars))}
          onKeyDown={handleKeyDown}
          placeholder="Paste or type a customer review here…"
          rows={8}
          className={clsx(
            'w-full px-4 py-3.5 bg-ink-50 border rounded-xl text-sm text-ink-900 placeholder-ink-300 resize-none transition-all duration-150 focus:outline-none leading-relaxed font-[Syne]',
            text.length > 0
              ? 'border-verdant-300 focus:border-verdant-400 focus:ring-2 focus:ring-verdant-100'
              : 'border-ink-200 focus:border-verdant-400 focus:ring-2 focus:ring-verdant-100'
          )}
        />

        {/* Character count */}
        <div
          className={clsx(
            'absolute bottom-3 right-3 text-[10px] font-medium font-mono transition-colors',
            remaining < 200 ? 'text-amber-500' : remaining < 50 ? 'text-crimson-500' : 'text-ink-300'
          )}
        >
          {remaining}
        </div>
      </div>

      {/* Source + Submit row */}
      <div className="flex items-center gap-3 mt-4">
        <div className="flex-1">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="input-field text-sm py-2.5"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt || 'Source (optional)'}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || analyzing}
          className={clsx(
            'btn-primary px-6 py-2.5 min-w-[140px] justify-center',
            analyzing && 'opacity-70 cursor-wait'
          )}
        >
          {analyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Send size={14} />
              Analyze Review
            </>
          )}
        </button>
      </div>

      {/* Hint */}
      <p className="text-[10px] text-ink-400 mt-3 font-medium">
        Analysis uses AFINN-165 word scoring + custom keyword bank + manipulation pattern detection.
        Results saved to history automatically.
      </p>
    </div>
  )
}