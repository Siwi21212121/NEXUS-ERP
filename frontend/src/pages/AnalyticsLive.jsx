import React, { useEffect, useState } from 'react'
import { Activity, DollarSign, Package, TrendingUp, Users } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AIAssistant from '../components/AIAssistant'
import DashboardAIPanel from '../components/DashboardAIPanel'
import api from '../utils/api'

const colors = ['#38bdf8', '#22d3ee', '#c084fc', '#60a5fa', '#22c55e']
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function fmt(value) {
  return money.format(Number(value || 0))
}

function StatCard({ icon: Icon, title, value, subtitle, color }) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-[11px] tracking-[3px] uppercase text-muted mb-2">{title}</p>
          <h2 className="text-4xl font-light" style={{ color }}>{value}</h2>
          <p className="text-sm text-muted mt-2">{subtitle}</p>
        </div>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="mt-4 h-1.5 bg-panel2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: '75%', backgroundColor: color }} />
      </div>
    </div>
  )
}

function RankingPanel({ title, data, valueFormatter = (value) => value }) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-6">
      <h2 className="text-2xl font-semibold mb-5">{title}</h2>
      <div className="space-y-4">
        {(data || []).map((item, index) => (
          <div key={`${title}-${item.name}-${index}`} className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-panel2 border border-line flex items-center justify-center text-xs text-muted">{index + 1}</span>
              <span>{item.name}</span>
            </div>
            <span className="font-semibold text-cyan-400">{valueFormatter(item.value)}</span>
          </div>
        ))}
        {!(data || []).length && <p className="text-muted text-sm">No data available from PostgreSQL yet.</p>}
      </div>
    </div>
  )
}

export default function AnalyticsLive() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        setError('')
        const response = await api.get('/analytics/executive-dashboard')
        setAnalytics(response.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load analytics dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const kpis = analytics?.kpis || {}
  const charts = analytics?.charts || {}

  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          {loading && <div className="mb-5 bg-panel border border-line rounded-2xl p-5 text-muted">Loading executive analytics...</div>}
          {error && <div className="mb-5 bg-red-950 border border-red-500/30 rounded-2xl p-5 text-red-200">{error}</div>}

          <div className="mb-8">
            <h1 className="text-5xl font-semibold mb-3">Executive Dashboard</h1>
            <p className="text-muted text-lg">Database-backed analytics across finance, HR, inventory, procurement and customer activity.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
            <StatCard icon={TrendingUp} title="Revenue" value={fmt(kpis.revenue)} subtitle={`${kpis.revenueGrowth || 0}% growth`} color="#67e8f9" />
            <StatCard icon={DollarSign} title="Expenses" value={fmt(kpis.expenses)} subtitle={`${kpis.profitMargin || 0}% margin`} color="#c084fc" />
            <StatCard icon={Users} title="Employees" value={kpis.employees || 0} subtitle={`${fmt(kpis.employeeProductivity)} / employee`} color="#60a5fa" />
            <StatCard icon={Package} title="Inventory" value={fmt(kpis.inventoryValue)} subtitle={`${kpis.inventoryTurnover || 0} turnover`} color="#22c55e" />
            <StatCard icon={Activity} title="Procurement" value={fmt(kpis.procurementCost)} subtitle={`${kpis.customerSatisfaction || 0}% satisfaction`} color="#f59e0b" />
          </div>

          <DashboardAIPanel moduleKey="analytics" refreshKey={`${loading}-${Object.keys(kpis).length}`} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">Revenue and Expenses</h2>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.revenueTrend || []}>
                    <XAxis dataKey="month" tick={{ fill: '#8a93a6' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="expenses" stroke="#c084fc" fill="#c084fc" fillOpacity={0.16} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">KPI Mix</h2>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.moduleMix || []} dataKey="value" nameKey="name" outerRadius={110}>
                      {(charts.moduleMix || []).map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">Profit Heatmap</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(charts.heatmap || []).map((item) => (
                  <div key={item.label} className="rounded-xl border border-line p-4" style={{ backgroundColor: Number(item.value) >= 0 ? 'rgba(34,211,238,0.12)' : 'rgba(239,68,68,0.12)' }}>
                    <p className="text-muted text-xs">{item.label}</p>
                    <p className="text-lg font-semibold mt-2">{fmt(item.value)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-3xl font-semibold mb-5">Customer Growth</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.customerGrowth || []}>
                    <XAxis dataKey="month" tick={{ fill: '#8a93a6', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line dataKey="customers" stroke="#22d3ee" strokeWidth={4} />
                    <Line dataKey="revenue" stroke="#60a5fa" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <RankingPanel title="Top Selling Products" data={charts.topProducts} />
            <RankingPanel title="Top Vendors" data={charts.topVendors} valueFormatter={(value) => Number(value || 0).toFixed(1)} />
            <RankingPanel title="Top Departments" data={charts.topDepartments} />
            <RankingPanel title="Top Customers" data={charts.topCustomers} valueFormatter={fmt} />
          </div>
        </main>
      </div>
      <AIAssistant />
    </div>
  )
}
