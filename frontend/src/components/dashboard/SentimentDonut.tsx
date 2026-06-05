import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { DashboardStats } from '@/types'

interface SentimentDonutProps {
  stats: DashboardStats | null
  loading: boolean
}

const COLORS = {
  positive: '#1a9a5e',
  negative: '#c82020',
  neutral: '#918b7c',
  mixed: '#c68a0e',
}

const RCOLORS = ['#1a9a5e', '#c82020', '#918b7c', '#c68a0e']

interface CustomLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomLabelProps) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
      fontFamily="Syne, sans-serif"
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

export default function SentimentDonut({ stats, loading }: SentimentDonutProps) {
  if (loading || !stats) {
    return (
      <div className="card p-5">
        <div className="skeleton h-4 w-36 mb-4" />
        <div className="skeleton h-48 w-full rounded-xl" />
      </div>
    )
  }

  const data = [
    { name: 'Positive', value: stats.positiveCount, color: COLORS.positive },
    { name: 'Negative', value: stats.negativeCount, color: COLORS.negative },
    { name: 'Neutral', value: stats.neutralCount, color: COLORS.neutral },
    { name: 'Mixed', value: stats.mixedCount, color: COLORS.mixed },
  ].filter((d) => d.value > 0)

  const total = stats.totalReviews

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label">Sentiment Distribution</p>
          <p className="text-base font-semibold text-ink-800 mt-0.5">
            {total.toLocaleString()} reviews analyzed
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center h-48 text-ink-400 text-sm">
          No data yet — start analyzing reviews
        </div>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={RCOLORS[index % RCOLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#181713',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px',
                  fontFamily: 'Syne',
                  padding: '8px 12px',
                }}
                formatter={(value: number, name: string) => [
                  `${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center mt-[-12px]">
              <p className="text-2xl font-bold text-ink-900">{total}</p>
              <p className="text-xs text-ink-400 font-medium">total</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {[
          { label: 'Positive', value: stats.positiveCount, color: COLORS.positive },
          { label: 'Negative', value: stats.negativeCount, color: COLORS.negative },
          { label: 'Neutral', value: stats.neutralCount, color: COLORS.neutral },
          { label: 'Mixed', value: stats.mixedCount, color: COLORS.mixed },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-ink-500 font-medium">{item.label}</span>
            <span className="text-xs font-semibold text-ink-700 ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}