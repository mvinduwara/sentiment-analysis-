import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ScanText,
  ClipboardList,
  Tags,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/analyze', label: 'Analyzer', icon: ScanText, exact: false },
  { to: '/history', label: 'Review History', icon: ClipboardList, exact: false },
  { to: '/keywords', label: 'Keyword Bank', icon: Tags, exact: false },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-30"
      style={{ width: 'var(--sidebar-w)' }}
    >
      <div className="flex-1 flex flex-col bg-ink-950 text-white overflow-hidden">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-ink-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-verdant-500 flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <div
                className="text-white font-bold text-lg leading-none"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              >
                SentiRate
              </div>
              <div className="text-ink-400 text-[10px] font-medium tracking-widest uppercase mt-0.5">
                Review Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-ink-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to) && to !== '/'
                ? true
                : exact
                  ? location.pathname === to
                  : location.pathname === to

            return (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive: active }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                    active
                      ? 'bg-verdant-500/15 text-verdant-300 border border-verdant-500/20'
                      : 'text-ink-400 hover:bg-ink-800 hover:text-white border border-transparent'
                  )
                }
              >
                {({ isActive: active }) => (
                  <>
                    <Icon
                      size={16}
                      className={clsx(
                        'flex-shrink-0 transition-colors',
                        active ? 'text-verdant-400' : 'text-ink-500 group-hover:text-ink-300'
                      )}
                    />
                    <span className="flex-1">{label}</span>
                    {active && (
                      <ChevronRight size={12} className="text-verdant-400 opacity-60" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer hint */}
        <div className="px-4 py-4 border-t border-ink-800">
          <div className="bg-ink-900 rounded-xl p-3">
            <p className="text-ink-300 text-xs font-medium mb-1">Hybrid NLP Engine</p>
            <p className="text-ink-500 text-[11px] leading-relaxed">
              AFINN-165 lexicon + custom keyword databank + manipulation detection
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}