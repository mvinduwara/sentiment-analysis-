import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { KeywordFrequency } from '@/types'

interface KeywordFrequencyProps {
  data: KeywordFrequency[]
  loading: boolean
}

const categoryColor: Record<string, string> = {
  positive: '#1a9a5e',
  negative: '#c82020',
  neutral: '#918b7c',
  spam: '#c68a0e',
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: KeywordFrequency; value: number }>
}) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-ink-950 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-ink-800">
      <p className="font-semibold mb-1">"{d.word}"</p>
      <p className="text-ink-300">
        Category: <span className="text-white capitalize">{d.category}</span>
      </p>
      <p className="text-ink-300">
        Occurrences: <span className="text-white">{d.count}</span>
      </p>
    </div>
  )
}

export default function KeywordFrequencyChart({ data, loading }: KeywordFrequencyProps) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-4 w-36 mb-4" />
        <div className="skeleton h-48 w-full rounded-xl" />
      </div>
    )
  }

  const top = data.slice(0, 12)

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="section-label">Top Keywords</p>
          <p className="text-base font-semibold text-ink-800 mt-0.5">Most frequent sentiment words</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {Object.entries(categoryColor).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-ink-500 capitalize font-medium">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {top.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-ink-400 text-sm">
          No keyword data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={top} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e0" strokeWidth={0.8} vertical={false} />
            <XAxis
              dataKey="word"
              tick={{ fontSize: 10, fontFamily: 'Syne', fill: '#918b7c' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: 'Syne', fill: '#918b7c' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {top.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={categoryColor[entry.category] ?? '#918b7c'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}