import { TrendingUp, TrendingDown, AlertTriangle, Activity, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import type { DashboardStats } from '@/types'

interface StatsCardsProps {
  stats: DashboardStats | null
  loading: boolean
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="stat-card">
            <div className="skeleton h-3 w-16 mb-2" />
            <div className="skeleton h-8 w-20" />
          </div>
        ))}
      </div>
    )
  }

  const positiveRate = stats.totalReviews > 0
    ? Math.round((stats.positiveCount / stats.totalReviews) * 100)
    : 0

  const manipRate = stats.totalReviews > 0
    ? Math.round((stats.manipulatedCount / stats.totalReviews) * 100)
    : 0

  const cards = [
    {
      label: 'Total Reviews',
      value: stats.totalReviews.toLocaleString(),
      icon: Activity,
      iconColor: 'text-azure-500',
      iconBg: 'bg-azure-50',
      sub: 'All time',
      subColor: 'text-ink-400',
    },
    {
      label: 'Positive Reviews',
      value: stats.positiveCount.toLocaleString(),
      icon: ThumbsUp,
      iconColor: 'text-verdant-600',
      iconBg: 'bg-verdant-50',
      sub: `${positiveRate}% of total`,
      subColor: 'text-verdant-600',
    },
    {
      label: 'Negative Reviews',
      value: stats.negativeCount.toLocaleString(),
      icon: ThumbsDown,
      iconColor: 'text-crimson-500',
      iconBg: 'bg-crimson-50',
      sub: stats.totalReviews > 0 ? `${Math.round((stats.negativeCount / stats.totalReviews) * 100)}% of total` : '—',
      subColor: 'text-crimson-500',
    },
    {
      label: 'Neutral / Mixed',
      value: (stats.neutralCount + stats.mixedCount).toLocaleString(),
      icon: Minus,
      iconColor: 'text-ink-500',
      iconBg: 'bg-ink-100',
      sub: 'Undecided sentiment',
      subColor: 'text-ink-400',
    },
    {
      label: 'Avg. Sentiment',
      value: `${stats.averageScore > 0 ? '+' : ''}${stats.averageScore.toFixed(1)}`,
      icon: stats.averageScore >= 0 ? TrendingUp : TrendingDown,
      iconColor: stats.averageScore >= 1 ? 'text-verdant-600' : stats.averageScore <= -1 ? 'text-crimson-500' : 'text-amber-500',
      iconBg: stats.averageScore >= 1 ? 'bg-verdant-50' : stats.averageScore <= -1 ? 'bg-crimson-50' : 'bg-amber-50',
      sub: 'AFINN score avg.',
      subColor: 'text-ink-400',
    },
    {
      label: 'Avg. Confidence',
      value: `${Math.round(stats.averageConfidence)}%`,
      icon: Activity,
      iconColor: 'text-azure-500',
      iconBg: 'bg-azure-50',
      sub: 'Analysis certainty',
      subColor: 'text-ink-400',
    },
    {
      label: 'Flagged Reviews',
      value: stats.manipulatedCount.toLocaleString(),
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      sub: `${manipRate}% flagged`,
      subColor: manipRate > 5 ? 'text-amber-600' : 'text-ink-400',
    },
    {
      label: 'Health Score',
      value: positiveRate >= 70 ? 'Excellent' : positiveRate >= 50 ? 'Good' : positiveRate >= 30 ? 'Fair' : 'Poor',
      icon: TrendingUp,
      iconColor: positiveRate >= 70 ? 'text-verdant-600' : positiveRate >= 50 ? 'text-azure-500' : positiveRate >= 30 ? 'text-amber-500' : 'text-crimson-500',
      iconBg: positiveRate >= 70 ? 'bg-verdant-50' : positiveRate >= 50 ? 'bg-azure-50' : positiveRate >= 30 ? 'bg-amber-50' : 'bg-crimson-50',
      sub: `${positiveRate}% positive rate`,
      subColor: positiveRate >= 70 ? 'text-verdant-600' : positiveRate >= 50 ? 'text-azure-600' : positiveRate >= 30 ? 'text-amber-600' : 'text-crimson-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="stat-card group animate-in"
          style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
        >
          <div className="flex items-start justify-between">
            <p className="section-label">{card.label}</p>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg} flex-shrink-0`}>
              <card.icon size={14} className={card.iconColor} />
            </div>
          </div>
          <p className="text-2xl font-bold text-ink-900 mt-1 tracking-tight">
            {card.value}
          </p>
          <p className={`text-xs font-medium ${card.subColor} mt-0.5`}>{card.sub}</p>
        </div>
      ))}
    </div>
  )
}