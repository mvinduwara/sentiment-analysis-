import { useLocation } from 'react-router-dom'
import { Bell, HelpCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { clsx } from 'clsx'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your review sentiment landscape' },
  '/analyze': { title: 'Analyzer', subtitle: 'Submit a review and get instant sentiment analysis' },
  '/history': { title: 'Review History', subtitle: 'Browse and filter all analyzed reviews' },
  '/keywords': { title: 'Keyword Bank', subtitle: 'Manage your custom sentiment keyword databank' },
}

export default function TopBar() {
  const location = useLocation()
  const { toasts, removeToast } = useAppStore()
  const page = pageTitles[location.pathname] ?? pageTitles['/']

  return (
    <>
      <header
        className="fixed top-0 right-0 z-20 bg-ink-50/90 backdrop-blur-sm border-b border-ink-100 flex items-center justify-between px-6"
        style={{ left: 'var(--sidebar-w)', height: 'var(--topbar-h)' }}
      >
        <div>
          <h1
            className="text-xl font-bold text-ink-900 leading-tight"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            {page.title}
          </h1>
          <p className="text-xs text-ink-400 font-medium mt-0.5">{page.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors">
            <HelpCircle size={18} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-verdant-500 rounded-full border-2 border-ink-50" />
          </button>
          <div className="w-8 h-8 rounded-full bg-verdant-100 flex items-center justify-center ml-2">
            <span className="text-xs font-semibold text-verdant-700">SR</span>
          </div>
        </div>
      </header>

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={clsx(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium cursor-pointer animate-slide-in-right transition-all',
              toast.type === 'success' && 'bg-verdant-50 border-verdant-200 text-verdant-800',
              toast.type === 'error' && 'bg-crimson-50 border-crimson-200 text-crimson-800',
              toast.type === 'warning' && 'bg-amber-50 border-amber-200 text-amber-800',
              toast.type === 'info' && 'bg-azure-50 border-azure-200 text-azure-800'
            )}
          >
            <span
              className={clsx(
                'w-2 h-2 rounded-full flex-shrink-0',
                toast.type === 'success' && 'bg-verdant-500',
                toast.type === 'error' && 'bg-crimson-500',
                toast.type === 'warning' && 'bg-amber-500',
                toast.type === 'info' && 'bg-azure-500'
              )}
            />
            {toast.message}
          </div>
        ))}
      </div>
    </>
  )
}