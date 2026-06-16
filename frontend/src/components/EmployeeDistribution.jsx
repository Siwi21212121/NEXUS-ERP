import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { employeeDistribution } from '../data/mockData.js'

export default function EmployeeDistribution() {
  const totalLabel = '12.4K'
  const distribution = Array.isArray(employeeDistribution)
    ? employeeDistribution
    : []

  return (
    <div className="bg-panel border border-line rounded-xl2 p-5">
      <h3 className="text-base font-semibold mb-4">Employee Distribution</h3>
      <div className="flex items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                dataKey="value"
                nameKey="name"
                innerRadius={42}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {distribution.map((entry) => (
                  <Cell key={entry?.name} fill={entry?.color || '#3a4150'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{totalLabel}</span>
            <span className="text-[10px] text-muted uppercase tracking-wide">Total</span>
          </div>
        </div>

        <ul className="space-y-2 text-sm">
          {distribution.map((entry) => (
            <li key={entry?.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry?.color || '#3a4150' }}
              />
              <span className="text-muted">
                {entry?.name || 'Unknown'} <span className="text-white font-medium">({entry?.value || 0}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
