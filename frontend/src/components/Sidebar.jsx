import React from 'react'
import {
  LayoutGrid,
  Wallet,
  Users,
  Boxes,
  ShoppingCart,
  BarChart3,
  BrainCircuit,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate, useLocation } from 'react-router-dom'
import { canView } from '../utils/permissions.js'

export default function Sidebar() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (loading) {
    return (
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-line bg-panel/60 px-4 py-6">
        <div className="text-sm text-muted">Loading navigation...</div>
      </aside>
    )
  }

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutGrid,
      path: '/dashboard',
      moduleKey: 'dashboard',
    },
    {
      label: 'Finance',
      icon: Wallet,
      path: '/finance',
      moduleKey: 'finance',
    },
    {
      label: 'HR Payroll',
      icon: Users,
      path: '/hr-payroll',
      moduleKey: 'hr-payroll',
    },
    {
      label: 'Supply Chain',
      icon: Boxes,
      path: '/supply-chain',
      moduleKey: 'supply-chain',
    },
    {
      label: 'Procurement',
      icon: ShoppingCart,
      path: '/procurement',
      moduleKey: 'procurement',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      moduleKey: 'analytics',
    },
    {
      label: 'AI Forecasting',
      icon: BrainCircuit,
      path: '/ai-forecasting',
      moduleKey: 'ai-forecasting',
    },
    {
      label: 'AI Copilot',
      icon: BrainCircuit,
      path: '/ai-copilot',
      moduleKey: 'ai-copilot',
    },
  ]

  const role = user?.role || localStorage.getItem('role')
  const visibleNavItems = navItems.filter((item) =>
    canView(role, item.moduleKey)
  )

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-line bg-panel/60 px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
          <LayoutGrid size={18} className="text-white" />
        </div>

        <div>
          <p className="text-base font-bold leading-tight">
            ClarioNex ERP
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted leading-tight">
            Enterprise Intelligence
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {visibleNavItems.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path

          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-accent text-white font-medium'
                  : 'text-muted hover:text-white hover:bg-panel2'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="space-y-1 pt-4 border-t border-line">
        <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:text-white hover:bg-panel2 transition-colors">
          <Settings size={18} />
          Settings
        </button>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mt-2">
          <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-semibold text-accent">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted truncate">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="text-muted hover:text-danger transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
