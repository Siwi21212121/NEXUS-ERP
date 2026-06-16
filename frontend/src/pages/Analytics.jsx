import React from 'react'
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AIAssistant from '../components/AIAssistant'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const revenueData = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 22 },
  { month: 'Mar', value: 18 },
  { month: 'Apr', value: 35 },
  { month: 'May', value: 30 },
  { month: 'Jun', value: 48 },
]

const growthData = [
  { value: 20 },
  { value: 28 },
  { value: 24 },
  { value: 39 },
  { value: 31 },
  { value: 52 },
]

const pieData = [
  { name: 'Finance', value: 35 },
  { name: 'HR', value: 20 },
  { name: 'Supply', value: 25 },
  { name: 'Projects', value: 20 },
]

const COLORS = [
  '#38bdf8',
  '#22d3ee',
  '#c084fc',
  '#60a5fa',
]

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
}) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-[11px] tracking-[3px] uppercase text-muted mb-2">
            {title}
          </p>

          <h2
            className="text-5xl font-light"
            style={{ color }}
          >
            {value}
          </h2>

          <p className="text-sm text-muted mt-2">
            {subtitle}
          </p>
        </div>

        <Icon
          size={22}
          style={{ color }}
        />
      </div>

      <div className="mt-4 h-1.5 bg-panel2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: '75%',
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export default function Analytics() {
  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-8 py-7">
          <div className="mb-8">
            <h1 className="text-5xl font-semibold mb-3">
              Analytics Center
            </h1>

            <p className="text-muted text-lg">
              Enterprise-wide business intelligence
              and performance metrics.
            </p>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              icon={TrendingUp}
              title="Revenue Growth"
              value="18.4%"
              subtitle="Monthly increase"
              color="#67e8f9"
            />

            <StatCard
              icon={Users}
              title="Active Users"
              value="12.4K"
              subtitle="Across all regions"
              color="#60a5fa"
            />

            <StatCard
              icon={DollarSign}
              title="Net Profit"
              value="$4.2M"
              subtitle="Q3 estimate"
              color="#22c55e"
            />

            <StatCard
              icon={Activity}
              title="Efficiency"
              value="92%"
              subtitle="Operational score"
              color="#c084fc"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Revenue Trend */}
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">
                Revenue Trend
              </h2>

              <div className="h-[300px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart data={revenueData}>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#38bdf8"
                      fill="#38bdf8"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Growth */}
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">
                Growth Analysis
              </h2>

              <div className="h-[300px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart data={growthData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#22d3ee"
                      strokeWidth={4}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Department Split */}
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">
                Department Usage
              </h2>

              <div className="h-[300px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      outerRadius={110}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KPI Panel */}
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">
                KPI Highlights
              </h2>

              <div className="space-y-5">
                <div className="bg-panel2 rounded-xl p-5 border border-line">
                  <h3 className="text-cyan-400 font-semibold">
                    Revenue increased 18%
                  </h3>

                  <p className="text-muted mt-2">
                    Sales teams exceeded
                    expectations in APAC.
                  </p>
                </div>

                <div className="bg-panel2 rounded-xl p-5 border border-line">
                  <h3 className="text-violet-400 font-semibold">
                    Workforce productivity up
                  </h3>

                  <p className="text-muted mt-2">
                    HR reports improved employee
                    performance.
                  </p>
                </div>

                <div className="bg-panel2 rounded-xl p-5 border border-line">
                  <h3 className="text-green-400 font-semibold">
                    Supply chain stabilized
                  </h3>

                  <p className="text-muted mt-2">
                    Logistics delays reduced by 24%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AIAssistant />
    </div>
  )
}