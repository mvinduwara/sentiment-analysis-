import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import FilterBar from '@/components/history/FilterBar'
import ReviewTable from '@/components/history/ReviewTable'
import type { Review } from '@/types'
import AnalysisResultDisplay from '@/components/analyzer/AnalysisResult'
import { X, Download } from 'lucide-react'
import client from '@/api/client'

export default function HistoryPage() {
  const { fetchReviews, reviews } = useAppStore()
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchReviews(1)
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await client.get('/reviews/export', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `sentirate-reviews-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail
    }
    setExporting(false)
  }

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-0.5">Review Management</p>
          <p className="text-sm text-ink-500">
            {reviews ? `${reviews.total.toLocaleString()} reviews in database` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-secondary text-xs px-4 py-2"
        >
          <Download size={13} className={exporting ? 'animate-bounce' : ''} />
          Export CSV
        </button>
      </div>

      <FilterBar />
      <ReviewTable onSelectReview={setSelectedReview} />

      {/* Review detail drawer */}
      {selectedReview && (
        <div className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm z-40 flex items-start justify-end p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b border-ink-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <p className="text-sm font-semibold text-ink-800">Review Details</p>
                <p className="text-xs text-ink-400 font-mono">
                  {new Date(selectedReview.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="card bg-ink-50 p-4 text-sm text-ink-700 leading-relaxed">
                {selectedReview.text}
              </div>
              <AnalysisResultDisplay
                result={{
                  score: selectedReview.score,
                  normalizedScore: selectedReview.normalizedScore,
                  label: selectedReview.label,
                  confidence: selectedReview.confidence,
                  isManipulated: selectedReview.isManipulated,
                  manipulationReasons: selectedReview.manipulationReasons,
                  keywords: selectedReview.keywords,
                  wordCount: selectedReview.wordCount,
                  dominantEmotion: selectedReview.dominantEmotion,
                  summary: selectedReview.summary,
                }}
                reviewText={selectedReview.text}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}