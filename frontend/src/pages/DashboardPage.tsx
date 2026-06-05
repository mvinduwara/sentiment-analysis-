import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import StatsCards from '@/components/dashboard/StatsCards'
import SentimentDonut from '@/components/dashboard/SentimentDonut'
import TrendLine from '@/components/dashboard/TrendLine'
import KeywordFrequencyChart from '@/components/dashboard/KeywordFrequency'

export default function DashboardPage() {
  const { stats, trend, topKeywords, loadingDashboard, fetchDashboard } = useAppStore()

  useEffect(() => {
    fetchDashboard()
  }, [])

  return (
    <div className="page-container space-y-6">
      {/* Header row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="section-label mb-1">Business Overview</p>
          <h2 className="heading-display text-3xl" style={{ fontFamily: 'DM Serif Display, serif' }}>
            Review Intelligence
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="btn-secondary text-xs px-3 py-2"
            disabled={loadingDashboard}
          >
            <RefreshCw size={13} className={loadingDashboard ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link to="/analyze" className="btn-primary text-xs px-4 py-2.5">
            Analyze Review
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <StatsCards stats={stats} loading={loadingDashboard} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <SentimentDonut stats={stats} loading={loadingDashboard} />
        </div>
        <div className="lg:col-span-2">
          <TrendLine data={trend} loading={loadingDashboard} />
        </div>
      </div>

      {/* Keyword frequency */}
      <KeywordFrequencyChart data={topKeywords} loading={loadingDashboard} />

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            to: '/analyze',
            title: 'Analyze a Review',
            desc: 'Submit any customer review for instant sentiment analysis with keyword highlighting.',
            cta: 'Open Analyzer',
            accent: 'bg-verdant-50 border-verdant-200 hover:bg-verdant-100',
            ctaColor: 'text-verdant-700',
          },
          {
            to: '/history',
            title: 'Browse History',
            desc: 'Search, filter, and manage all previously analyzed reviews.',
            cta: 'View History',
            accent: 'bg-azure-50 border-azure-200 hover:bg-azure-100',
            ctaColor: 'text-azure-700',
          },
          {
            to: '/keywords',
            title: 'Manage Keywords',
            desc: 'Customize your sentiment keyword databank to improve analysis accuracy.',
            cta: 'Manage Bank',
            accent: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
            ctaColor: 'text-amber-700',
          },
        ].map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className={`card p-5 border transition-all duration-150 group ${card.accent}`}
          >
            <h3 className="text-sm font-semibold text-ink-800 mb-1.5">{card.title}</h3>
            <p className="text-xs text-ink-500 leading-relaxed mb-3">{card.desc}</p>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${card.ctaColor}`}>
              {card.cta}
              <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}