import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { TrendPoint } from '@/types'

interface TrendLineProps {
  data: TrendPoint[]
  loading: boolean
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-950 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-ink-800">
      <p className="text-ink-300 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-ink-400 capitalize">{p.name}</span>
          <span className="font-semibold ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendLine({ data, loading }: TrendLineProps) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-4 w-36 mb-4" />
        <div className="skeleton h-48 w-full rounded-xl" />
      </div>
    )
  }

  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="card p-5">
      <div className="mb-4">
        <p className="section-label">Sentiment Trend</p>
        <p className="text-base font-semibold text-ink-800 mt-0.5">
          Last 30 days — daily review volume
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-ink-400 text-sm">
          No trend data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e0" strokeWidth={0.8} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontFamily: 'Syne', fill: '#918b7c' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: 'Syne', fill: '#918b7c' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'Syne', paddingTop: '8px' }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="positive"
              stroke="#1a9a5e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="negative"
              stroke="#c82020"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="neutral"
              stroke="#918b7c"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}