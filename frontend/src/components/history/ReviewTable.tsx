import { useState } from 'react'
import { Trash2, ChevronLeft, ChevronRight, ExternalLink, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { Review } from '@/types'
import { clsx } from 'clsx'

interface ReviewTableProps {
  onSelectReview?: (review: Review) => void
}

const labelBadge: Record<string, string> = {
  positive: 'badge-positive',
  negative: 'badge-negative',
  neutral: 'badge-neutral',
  mixed: 'badge-warning',
}

const labelDot: Record<string, string> = {
  positive: 'bg-verdant-500',
  negative: 'bg-crimson-500',
  neutral: 'bg-ink-400',
  mixed: 'bg-amber-500',
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="progress-bar-bg w-16">
        <div
          className={clsx(
            'progress-bar-fill',
            value >= 70 ? 'bg-verdant-400' : value >= 40 ? 'bg-amber-400' : 'bg-crimson-400'
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium text-ink-500">{Math.round(value)}%</span>
    </div>
  )
}

export default function ReviewTable({ onSelectReview }: ReviewTableProps) {
  const { reviews, loadingReviews, currentPage, fetchReviews, deleteReview } = useAppStore()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this review?')) return
    setDeletingId(id)
    await deleteReview(id)
    setDeletingId(null)
  }

  if (loadingReviews) {
    return (
      <div className="card overflow-hidden">
        <div className="p-5 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!reviews || reviews.reviews.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-ink-400 text-sm font-medium">No reviews found for the current filter.</p>
        <p className="text-ink-300 text-xs mt-1">Try adjusting your filters or add some reviews in the Analyzer.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/70">
              {['Review Text', 'Sentiment', 'Score', 'Confidence', 'Source', 'Date', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-semibold text-ink-400 uppercase tracking-widest whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {reviews.reviews.map((review) => (
              <tr
                key={review.id}
                className="table-row-hover cursor-pointer"
                onClick={() => onSelectReview?.(review)}
              >
                {/* Text preview */}
                <td className="px-4 py-3.5 max-w-xs">
                  <div className="flex items-start gap-2">
                    <span
                      className={clsx(
                        'w-2 h-2 rounded-full flex-shrink-0 mt-1.5',
                        labelDot[review.label] ?? 'bg-ink-300'
                      )}
                    />
                    <div>
                      <p className="text-sm text-ink-800 line-clamp-2 leading-snug">
                        {review.text}
                      </p>
                      {review.isManipulated && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle size={10} className="text-amber-500" />
                          <span className="text-[10px] text-amber-600 font-medium">Flagged</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Label */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className={labelBadge[review.label] ?? 'badge-neutral'}>
                    {review.label}
                  </span>
                </td>

                {/* Score */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span
                    className={clsx(
                      'text-sm font-bold tabular-nums',
                      review.score > 0 ? 'text-verdant-600' : review.score < 0 ? 'text-crimson-600' : 'text-ink-500'
                    )}
                  >
                    {review.score > 0 ? '+' : ''}{review.score}
                  </span>
                </td>

                {/* Confidence */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <ConfidenceBar value={review.confidence} />
                </td>

                {/* Source */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="text-xs text-ink-400 font-medium">
                    {review.source || '—'}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="text-xs text-ink-400 font-mono">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit',
                    })}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectReview?.(review) }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:bg-azure-50 hover:text-azure-600 transition-colors"
                    >
                      <ExternalLink size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(review.id, e)}
                      disabled={deletingId === review.id}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:bg-crimson-50 hover:text-crimson-600 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {reviews.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100 bg-ink-50/50">
          <p className="text-xs text-ink-400 font-medium">
            Showing {(currentPage - 1) * reviews.limit + 1}–
            {Math.min(currentPage * reviews.limit, reviews.total)} of {reviews.total.toLocaleString()}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchReviews(currentPage - 1)}
              disabled={currentPage <= 1}
              className="btn-secondary text-xs px-2 py-1.5 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, reviews.totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(currentPage - 2, reviews.totalPages - 4)) + i
              return (
                <button
                  key={page}
                  onClick={() => fetchReviews(page)}
                  className={clsx(
                    'w-8 h-7 text-xs font-semibold rounded-lg transition-colors',
                    page === currentPage
                      ? 'bg-ink-900 text-white'
                      : 'text-ink-500 hover:bg-ink-100'
                  )}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => fetchReviews(currentPage + 1)}
              disabled={currentPage >= reviews.totalPages}
              className="btn-secondary text-xs px-2 py-1.5 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}