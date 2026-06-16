import React from 'react'
import { Wallet, Users, Box, BrainCircuit } from 'lucide-react'

const icons = {
  wallet: Wallet,
  users: Users,
  box: Box,
  brain: BrainCircuit,
}

const tagToneClasses = {
  good: 'text-good',
  muted: 'text-muted',
  violet: 'text-violet',
}

export default function StatCard({ label, value, tag, tagTone, barPct, barColor, icon }) {
  const Icon = icons[icon] || Box
  const progress = Number.isFinite(Number(barPct)) ? Number(barPct) : 0

  return (
    <div className="bg-panel border border-line rounded-xl2 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-panel2 border border-line flex items-center justify-center text-white">
          <Icon size={16} />
        </div>
        <span className={`text-xs font-medium ${tagToneClasses[tagTone] || 'text-muted'}`}>
          {tag || 'Ready'}
        </span>
      </div>
      <div>
        <p className="text-sm text-muted mb-1">{label || 'Metric'}</p>
        <p className="text-2xl font-bold">{value || '0'}</p>
      </div>
      <div className="h-1.5 w-full rounded-full bg-panel2 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, backgroundColor: barColor || '#3a4150' }}
        />
      </div>
    </div>
  )
}
