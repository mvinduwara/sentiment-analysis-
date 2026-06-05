import { Routes, Route } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import DashboardPage from '@/pages/DashboardPage'
import AnalyzerPage from '@/pages/AnalyzerPage'
import HistoryPage from '@/pages/HistoryPage'
import KeywordsPage from '@/pages/KeywordsPage'

export default function App() {
  return (
    <div className="min-h-screen bg-ink-50">
      <div className="noise-overlay" aria-hidden="true" />

      <Sidebar />

      <div
        className="flex flex-col min-h-screen"
        style={{ marginLeft: 'var(--sidebar-w)' }}
      >
        <TopBar />

        <main
          className="flex-1"
          style={{ paddingTop: 'var(--topbar-h)' }}
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analyze" element={<AnalyzerPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/keywords" element={<KeywordsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}