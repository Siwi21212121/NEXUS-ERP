import React from 'react'
import { AlertTriangle, AlertCircle, TrendingUp, Zap } from 'lucide-react'
import { alerts } from '../data/mockData.js'

const toneStyles = {
  danger: {
    border: 'border-danger/30',
    bg: 'bg-danger/10',
    icon: 'text-danger',
    action: 'text-danger',
    Icon: AlertTriangle,
  },
  warn: {
    border: 'border-warn/30',
    bg: 'bg-warn/10',
    icon: 'text-warn',
    action: 'text-warn',
    Icon: AlertCircle,
  },
  cyan: {
    border: 'border-cyan/30',
    bg: 'bg-cyan/10',
    icon: 'text-cyan',
    action: 'text-cyan',
    Icon: TrendingUp,
  },
}

export default function AlertsPanel() {
  const alertItems = Array.isArray(alerts) ? alerts : []

  return (
    <div className="bg-panel border border-line rounded-xl2 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-accent" />
        <h3 className="text-base font-semibold">Executive Alerts</h3>
      </div>

      <div className="flex flex-col gap-3">
        {alertItems.map((alert) => {
          const tone = toneStyles[alert?.tone] || toneStyles.cyan
          const Icon = tone.Icon
          return (
            <div
              key={alert?.id || alert?.title}
              className={`rounded-lg border ${tone.border} ${tone.bg} p-4 flex flex-col gap-2`}
            >
              <div className="flex items-start gap-2">
                <Icon size={16} className={`${tone.icon} mt-0.5 shrink-0`} />
                <h4 className="font-semibold text-sm leading-snug">{alert?.title || 'No alert title'}</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed">{alert?.body || 'No alert details available.'}</p>
              <button
                className={`text-xs font-bold tracking-wide uppercase text-left ${tone.action} hover:underline`}
              >
                {alert?.action || 'Review'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
