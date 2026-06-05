import { AlertTriangle, CheckCircle, MinusCircle, XCircle, Info, TrendingUp } from 'lucide-react'
import type { AnalysisResult } from '@/types'
import { clsx } from 'clsx'

interface AnalysisResultProps {
  result: AnalysisResult
  reviewText: string
}

const labelConfig = {
  positive: {
    label: 'Positive',
    icon: CheckCircle,
    textColor: 'text-verdant-700',
    bg: 'bg-verdant-50',
    border: 'border-verdant-200',
    barColor: 'bg-verdant-500',
    ringColor: '#1a9a5e',
  },
  negative: {
    label: 'Negative',
    icon: XCircle,
    textColor: 'text-crimson-700',
    bg: 'bg-crimson-50',
    border: 'border-crimson-200',
    barColor: 'bg-crimson-500',
    ringColor: '#c82020',
  },
  neutral: {
    label: 'Neutral',
    icon: MinusCircle,
    textColor: 'text-ink-600',
    bg: 'bg-ink-50',
    border: 'border-ink-200',
    barColor: 'bg-ink-400',
    ringColor: '#918b7c',
  },
  mixed: {
    label: 'Mixed',
    icon: TrendingUp,
    textColor: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    barColor: 'bg-amber-500',
    ringColor: '#c68a0e',
  },
}

const categoryChipClass: Record<string, string> = {
  positive: 'keyword-chip-positive',
  negative: 'keyword-chip-negative',
  neutral: 'keyword-chip-neutral',
  spam: 'keyword-chip-spam',
}

function highlightText(text: string, result: AnalysisResult): JSX.Element {
  const keywords = result.keywords
  if (!keywords.length) return <span>{text}</span>

  const sortedKeywords = [...keywords].sort((a, b) => b.word.length - a.word.length)
  const parts: Array<{ text: string; category?: string }> = []
  let remaining = text
  const lowerRemaining = remaining.toLowerCase()

  const positions: Array<{ start: number; end: number; word: string; category: string }> = []
  for (const kw of sortedKeywords) {
    let idx = lowerRemaining.indexOf(kw.word.toLowerCase())
    while (idx !== -1) {
      const overlaps = positions.some((p) => idx < p.end && idx + kw.word.length > p.start)
      if (!overlaps) {
        positions.push({ start: idx, end: idx + kw.word.length, word: kw.word, category: kw.category })
      }
      idx = lowerRemaining.indexOf(kw.word.toLowerCase(), idx + 1)
    }
  }
  positions.sort((a, b) => a.start - b.start)

  let cursor = 0
  for (const pos of positions) {
    if (pos.start > cursor) {
      parts.push({ text: remaining.slice(cursor, pos.start) })
    }
    parts.push({ text: remaining.slice(pos.start, pos.end), category: pos.category })
    cursor = pos.end
  }
  if (cursor < remaining.length) {
    parts.push({ text: remaining.slice(cursor) })
  }

  return (
    <>
      {parts.map((p, i) =>
        p.category ? (
          <span
            key={i}
            className={clsx(
              'rounded px-0.5',
              p.category === 'positive' && 'highlight-positive',
              p.category === 'negative' && 'highlight-negative',
              p.category === 'spam' && 'highlight-spam',
              p.category === 'neutral' && 'bg-ink-100 text-ink-600'
            )}
          >
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  )
}

export default function AnalysisResultDisplay({ result, reviewText }: AnalysisResultProps) {
  const config = labelConfig[result.label]
  const Icon = config.icon
  const circumference = 2 * Math.PI * 38
  const offset = circumference - (result.confidence / 100) * circumference

  return (
    <div className="space-y-4 animate-in" style={{ opacity: 0, animationDelay: '100ms' }}>
      {/* Manipulation warning */}
      {result.isManipulated && (
        <div className="card border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              ⚠ Potential Manipulation Detected
            </p>
            <p className="text-xs text-amber-700 mt-1">
              This review exhibits suspicious patterns that may indicate an artificial or inauthentic submission.
            </p>
            <ul className="mt-2 space-y-0.5">
              {result.manipulationReasons.map((r, i) => (
                <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main result card */}
      <div className={clsx('card p-5 border', config.border, config.bg)}>
        <div className="flex items-start gap-5">
          {/* Score ring */}
          <div className="flex-shrink-0">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="38" fill="none" stroke="#e8e6e0" strokeWidth="6" />
              <circle
                cx="44"
                cy="44"
                r="38"
                fill="none"
                stroke={config.ringColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="score-ring"
              />
              <text
                x="44"
                y="40"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fontWeight="700"
                fontFamily="Syne"
                fill={config.ringColor}
              >
                {Math.round(result.confidence)}%
              </text>
              <text
                x="44"
                y="56"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontFamily="Syne"
                fill="#918b7c"
              >
                confidence
              </text>
            </svg>
          </div>

          {/* Label & details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={18} className={config.textColor} />
              <span
                className={clsx('text-2xl font-bold heading-display', config.textColor)}
                style={{ fontFamily: 'DM Serif Display, serif' }}
              >
                {config.label}
              </span>
              {result.isManipulated && (
                <span className="badge-warning text-[10px] ml-1">⚠ Flagged</span>
              )}
            </div>

            <p className="text-sm text-ink-600 mb-3 leading-relaxed">{result.summary}</p>

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/70 rounded-xl p-3 border border-white">
                <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-wide mb-1">
                  AFINN Score
                </p>
                <p className={clsx('text-lg font-bold', config.textColor)}>
                  {result.score > 0 ? '+' : ''}{result.score}
                </p>
              </div>
              <div className="bg-white/70 rounded-xl p-3 border border-white">
                <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-wide mb-1">
                  Normalized
                </p>
                <p className={clsx('text-lg font-bold', config.textColor)}>
                  {(result.normalizedScore * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-white/70 rounded-xl p-3 border border-white">
                <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-wide mb-1">
                  Words
                </p>
                <p className="text-lg font-bold text-ink-700">{result.wordCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlighted text */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-ink-400" />
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest">
            Keyword Highlights
          </p>
        </div>
        <p className="text-sm leading-loose text-ink-700">
          {highlightText(reviewText, result)}
        </p>
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-ink-100">
          {[
            { label: 'Positive word', color: 'highlight-positive' },
            { label: 'Negative word', color: 'highlight-negative' },
            { label: 'Spam indicator', color: 'highlight-spam' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={clsx('px-2 py-0.5 text-[10px] font-medium rounded', l.color)}>
                example
              </span>
              <span className="text-[10px] text-ink-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Found keywords */}
      {result.keywords.length > 0 && (
        <div className="card p-5">
          <p className="section-label mb-3">Detected Keywords ({result.keywords.length})</p>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((kw, i) => (
              <span
                key={i}
                className={categoryChipClass[kw.category] ?? 'keyword-chip bg-ink-50 text-ink-600 border-ink-200'}
              >
                {kw.word}
                {kw.occurrences > 1 && (
                  <span className="opacity-60 font-medium">×{kw.occurrences}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}