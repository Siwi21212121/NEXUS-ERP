import React from 'react'
import { Download, Plus } from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import AIAssistant from '../components/AIAssistant.jsx'
import StatCard from '../components/StatCard.jsx'
import RevenueChart from '../components/RevenueChart.jsx'
import AlertsPanel from '../components/AlertsPanel.jsx'
import EmployeeDistribution from '../components/EmployeeDistribution.jsx'
import InventoryStatus from '../components/InventoryStatus.jsx'
import ActiveLogistics from '../components/ActiveLogistics.jsx'
import { stats } from '../data/mockData.js'
import { useAuth } from '../context/AuthContext.jsx'
import useRole from '../hooks/useRole.js'

const fallbackStats = Array.isArray(stats) ? stats : []

const statById = fallbackStats.reduce((acc, stat) => {
  if (stat?.id) acc[stat.id] = stat
  return acc
}, {})

const roleStats = {
  OWNER: [
    statById.revenue,
    statById.employees,
    statById.inventory,
    statById.forecast,
  ],
  HR_MANAGER: [
    statById.employees,
    {
      id: 'payroll',
      label: 'Payroll Metrics',
      value: '$1.8M',
      tag: 'On cycle',
      tagTone: 'good',
      barPct: 82,
      barColor: '#22d3ee',
      icon: 'wallet',
    },
    {
      id: 'attendance',
      label: 'Attendance Metrics',
      value: '96%',
      tag: 'Stable',
      tagTone: 'good',
      barPct: 96,
      barColor: '#34d399',
      icon: 'users',
    },
    {
      id: 'leave',
      label: 'Leave Requests',
      value: '18',
      tag: 'Pending',
      tagTone: 'muted',
      barPct: 45,
      barColor: '#a78bfa',
      icon: 'users',
    },
  ],
  FINANCE_MANAGER: [
    statById.revenue,
    {
      id: 'expenses',
      label: 'Expenses',
      value: '$18.6M',
      tag: '-3.2% vs LM',
      tagTone: 'good',
      barPct: 58,
      barColor: '#22d3ee',
      icon: 'wallet',
    },
    {
      id: 'budgets',
      label: 'Budgets',
      value: '87%',
      tag: 'Utilized',
      tagTone: 'muted',
      barPct: 87,
      barColor: '#3b82f6',
      icon: 'wallet',
    },
    {
      id: 'financial-kpis',
      label: 'Financial KPIs',
      value: '94%',
      tag: 'Healthy',
      tagTone: 'good',
      barPct: 94,
      barColor: '#34d399',
      icon: 'brain',
    },
  ],
  PROJECT_MANAGER: [
    {
      id: 'logistics',
      label: 'Logistics',
      value: '1,374',
      tag: 'Active lanes',
      tagTone: 'good',
      barPct: 74,
      barColor: '#22d3ee',
      icon: 'box',
    },
    statById.inventory,
    {
      id: 'active-projects',
      label: 'Active Projects',
      value: '24',
      tag: '6 at risk',
      tagTone: 'muted',
      barPct: 68,
      barColor: '#3b82f6',
      icon: 'box',
    },
    {
      id: 'project-status',
      label: 'Project Status',
      value: '91%',
      tag: 'On track',
      tagTone: 'good',
      barPct: 91,
      barColor: '#34d399',
      icon: 'brain',
    },
  ],
  EMPLOYEE: [
    {
      id: 'personal-tasks',
      label: 'Personal Tasks',
      value: '7',
      tag: 'Due this week',
      tagTone: 'muted',
      barPct: 55,
      barColor: '#3b82f6',
      icon: 'box',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      value: '12',
      tag: 'Unread',
      tagTone: 'muted',
      barPct: 40,
      barColor: '#22d3ee',
      icon: 'brain',
    },
    {
      id: 'assigned-projects',
      label: 'Assigned Projects',
      value: '3',
      tag: 'Active',
      tagTone: 'good',
      barPct: 72,
      barColor: '#34d399',
      icon: 'users',
    },
  ],
}

function MetricPanel({ title, body, action }) {
  return (
    <div className="bg-panel border border-line rounded-xl2 p-5">
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{body}</p>
      <button className="text-xs font-bold tracking-wide uppercase text-left text-cyan hover:underline mt-4">
        {action}
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { loading } = useAuth()
  const { role, isOwner, isHR, isFinance, isProjectManager, isEmployee } = useRole()
  const visibleStats = (roleStats[role] || roleStats.EMPLOYEE).filter(Boolean)

  if (loading) {
    return (
      <div className="min-h-screen bg-base text-white flex items-center justify-center">
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-6 py-6 flex flex-col gap-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Enterprise Intelligence Center</h1>
              <p className="text-sm text-muted mt-1">Real-time oversight for global operations</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-panel2 border border-line rounded-lg px-4 py-2 text-sm font-medium hover:bg-line transition-colors">
                <Download size={16} />
                Export Report
              </button>
              <button className="flex items-center gap-2 bg-accent rounded-lg px-4 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors">
                <Plus size={16} />
                New Scenario
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleStats.map((stat) => (
              <StatCard key={stat?.id} {...stat} />
            ))}
          </div>

          {isOwner && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RevenueChart />
                </div>
                <AlertsPanel />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <EmployeeDistribution />
                <InventoryStatus />
                <ActiveLogistics />
              </div>
            </>
          )}

          {isHR && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <EmployeeDistribution />
              <MetricPanel
                title="Payroll Metrics"
                body="Payroll processing, variance checks, and compensation readiness are available for HR review."
                action="Review payroll"
              />
              <MetricPanel
                title="Attendance Metrics"
                body="Attendance trends are stable across active teams with exceptions ready for manager follow-up."
                action="Open attendance"
              />
              <MetricPanel
                title="Leave Requests"
                body="Pending leave requests are queued by priority with current staffing coverage preserved."
                action="Manage leave"
              />
            </div>
          )}

          {isFinance && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RevenueChart />
                </div>
                <MetricPanel
                  title="Expenses"
                  body="Expense movement is tracking below last month with operational spend inside approved thresholds."
                  action="View expenses"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MetricPanel
                  title="Budgets"
                  body="Department budgets remain within allocation, with upcoming approvals ready for review."
                  action="Open budgets"
                />
                <MetricPanel
                  title="Financial KPIs"
                  body="Margin, cash flow, and collection indicators remain healthy across the reporting period."
                  action="View KPIs"
                />
              </div>
            </>
          )}

          {isProjectManager && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ActiveLogistics />
              <InventoryStatus />
              <MetricPanel
                title="Active Projects"
                body="Project delivery is progressing across active workstreams with risk items ready for triage."
                action="Open projects"
              />
              <MetricPanel
                title="Project Status"
                body="Milestone completion remains on track with dependencies visible for project owners."
                action="Review status"
              />
            </div>
          )}

          {isEmployee && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MetricPanel
                title="Personal Tasks"
                body="Your assigned tasks are organized by due date and readiness for completion."
                action="View tasks"
              />
              <MetricPanel
                title="Notifications"
                body="Recent updates and approvals that need your attention are collected here."
                action="Open notifications"
              />
              <MetricPanel
                title="Assigned Projects"
                body="Your current project assignments and status updates are available for review."
                action="View assignments"
              />
            </div>
          )}

          <footer className="text-center text-xs text-muted py-4">
            Nexus Enterprise Resource Planning &middot; V4.2.0 &middot; Last Sync: 02:45 UTC
          </footer>
        </main>
      </div>

      {isOwner && <AIAssistant />}
    </div>
  )
}
