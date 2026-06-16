import React from 'react'
import {
  Wallet,
  CreditCard,
  Landmark,
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AIAssistant from '../components/AIAssistant'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from 'recharts'

const revenueData = [
  { month: 'JAN', value: 35 },
  { month: 'FEB', value: 42 },
  { month: 'MAR', value: 48 },
  { month: 'APR', value: 38 },
  { month: 'MAY', value: 55 },
  { month: 'JUN', value: 62 },
  { month: 'JUL', value: 51 },
]

const accounts = [
  {
    id: 'INV-2024-0891',
    company: 'Starlight Logistics Corp.',
    amount: '$142,500.00',
    status: 'Paid',
    date: 'Jul 28, 2024',
  },
  {
    id: 'INV-2024-0902',
    company: 'Global Cloud Infra',
    amount: '$3,105.00',
    status: 'Pending',
    date: 'Aug 15, 2024',
  },
  {
    id: 'INV-2024-0845',
    company: 'Nebula Dynamics',
    amount: '$22,400.00',
    status: 'Overdue',
    date: 'Jul 12, 2024',
  },
  {
    id: 'INV-2024-0915',
    company: 'Orion R&D Labs',
    amount: '$68,200.00',
    status: 'Pending',
    date: 'Aug 22, 2024',
  },
]

function FinanceCard({
  icon: Icon,
  title,
  value,
  subtext,
  color,
}) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex justify-between items-start mb-6">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={22} style={{ color }} />
        </div>

        <span
          className="text-xs font-medium"
          style={{ color }}
        >
          {subtext}
        </span>
      </div>

      <p className="text-xs tracking-[3px] uppercase text-muted mb-3">
        {title}
      </p>

      <h2 className="text-4xl font-light leading-tight">
        {value}
      </h2>

      <div className="mt-5 h-1.5 bg-panel2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: '65%',
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export default function Finance() {
  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-8 py-7">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-semibold mb-3">
              Financial Command Center
            </h1>

            <p className="text-muted text-lg max-w-4xl">
              Real-time fiscal monitoring across global
              business units. Integrated with AI forecasting
              and automated reconciliation pipelines.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <FinanceCard
              icon={Wallet}
              title="Total Revenue (Q3)"
              value="$42,891,000.00"
              subtext="+14.2% YoY"
              color="#60a5fa"
            />

            <FinanceCard
              icon={Landmark}
              title="Outstanding Receivables"
              value="$12,405,120.00"
              subtext="Due in 5d"
              color="#22d3ee"
            />

            <FinanceCard
              icon={CreditCard}
              title="Accounts Payable"
              value="$8,212,500.00"
              subtext="On Track"
              color="#c084fc"
            />
          </div>

          {/* Revenue Chart */}
          <div className="bg-panel border border-line rounded-2xl p-6 mb-6">
            <h2 className="text-2xl mb-1">
              Revenue Reports
            </h2>

            <p className="text-xs tracking-[3px] uppercase text-muted mb-6">
              Fiscal Year Performance Monitor
            </p>

            <div className="h-[350px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={revenueData}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8a93a6' }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    radius={[10, 10, 0, 0]}
                    fill="#94a3b8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="bg-panel border border-line rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-line">
              <h2 className="text-xl">
                Recent Accounts Activity
              </h2>

              <div className="flex gap-3">
                <button className="bg-panel2 px-4 py-2 rounded-lg border border-line text-sm">
                  Receivables
                </button>

                <button className="text-muted text-sm">
                  Payables
                </button>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-panel2 text-muted text-xs uppercase">
                <tr>
                  <th className="text-left p-5">
                    Invoice ID
                  </th>
                  <th className="text-left p-5">
                    Counterparty
                  </th>
                  <th className="text-left p-5">
                    Amount
                  </th>
                  <th className="text-left p-5">
                    Status
                  </th>
                  <th className="text-left p-5">
                    Due Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-line"
                  >
                    <td className="p-5">
                      {item.id}
                    </td>

                    <td className="p-5">
                      {item.company}
                    </td>

                    <td className="p-5 font-semibold">
                      {item.amount}
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${
                          item.status === 'Paid'
                            ? 'border-cyan-500 text-cyan-400'
                            : item.status === 'Pending'
                            ? 'border-violet-500 text-violet-400'
                            : 'border-red-500 text-red-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-5 text-muted">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <AIAssistant />
    </div>
  )
}