import React from 'react'
import {
  Users,
  UserCheck,
  BadgeDollarSign,
  Clock3,
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AIAssistant from '../components/AIAssistant'

const employees = [
  {
    name: 'Sophia Turner',
    role: 'HR Manager',
    status: 'Active',
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    status: 'Remote',
  },
  {
    name: 'Emma Wilson',
    role: 'Finance Executive',
    status: 'On Leave',
  },
  {
    name: 'David Johnson',
    role: 'Operations Lead',
    status: 'Active',
  },
]

function HRCard({
  icon: Icon,
  title,
  value,
  subtext,
  color,
}) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex justify-between items-start mb-5">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${color}20`,
          }}
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

      <h2 className="text-4xl font-light">
        {value}
      </h2>

      <div className="mt-5 h-1.5 bg-panel2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: '72%',
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export default function HRPayroll() {
  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-8 py-7">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-semibold mb-3">
              Human Resources & Payroll
            </h1>

            <p className="text-muted text-lg max-w-4xl">
              Employee lifecycle management,
              payroll automation and workforce
              performance monitoring.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
            <HRCard
              icon={Users}
              title="Total Employees"
              value="12,480"
              subtext="+2.4%"
              color="#60a5fa"
            />

            <HRCard
              icon={UserCheck}
              title="Retention Rate"
              value="94.8%"
              subtext="Stable"
              color="#22d3ee"
            />

            <HRCard
              icon={BadgeDollarSign}
              title="Payroll Processed"
              value="$18.2M"
              subtext="This Month"
              color="#c084fc"
            />

            <HRCard
              icon={Clock3}
              title="Pending Leaves"
              value="214"
              subtext="Review"
              color="#f59e0b"
            />
          </div>

          {/* Employee Directory */}
          <div className="bg-panel border border-line rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-line">
              <h2 className="text-2xl">
                Employee Directory
              </h2>

              <p className="text-muted text-sm mt-1">
                Workforce overview
              </p>
            </div>

            <table className="w-full">
              <thead className="bg-panel2 text-muted text-xs uppercase">
                <tr>
                  <th className="text-left p-5">
                    Employee Name
                  </th>
                  <th className="text-left p-5">
                    Role
                  </th>
                  <th className="text-left p-5">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.name}
                    className="border-t border-line"
                  >
                    <td className="p-5">
                      {employee.name}
                    </td>

                    <td className="p-5 text-muted">
                      {employee.role}
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${
                          employee.status ===
                          'Active'
                            ? 'border-cyan-500 text-cyan-400'
                            : employee.status ===
                              'Remote'
                            ? 'border-violet-500 text-violet-400'
                            : 'border-yellow-500 text-yellow-400'
                        }`}
                      >
                        {employee.status}
                      </span>
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