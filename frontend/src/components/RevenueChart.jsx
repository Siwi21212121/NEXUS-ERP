import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { revenueTrend } from '../data/mockData.js'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-panel2 border border-line rounded-lg px-3 py-2 text-xs">
      <p className="text-muted">{label}</p>
      <p className="font-semibold text-white">${payload[0].value}M</p>
    </div>
  )
}

export default function RevenueChart() {
  const chartData = Array.isArray(revenueTrend) ? revenueTrend : []

  return (
    <div className="bg-panel border border-line rounded-xl2 p-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold">Revenue Trend</h3>
          <p className="text-sm text-muted">Consolidated global performance (12 months)</p>
        </div>
        <select className="bg-panel2 border border-line rounded-lg text-sm px-3 py-1.5 text-white">
          <option>Last 12 Months</option>
          <option>Last 6 Months</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8a93a6', fontSize: 12 }}
            />
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#revenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
