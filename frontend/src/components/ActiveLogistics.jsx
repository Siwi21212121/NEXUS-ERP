import React from 'react'
import { logistics } from '../data/mockData.js'

export default function ActiveLogistics() {
  const activeLogistics = logistics || {}

  return (
    <div className="bg-panel border border-line rounded-xl2 overflow-hidden">
      <div className="h-32 w-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_60%),radial-gradient(circle_at_70%_60%,rgba(34,211,238,0.18),transparent_55%)] bg-panel2 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold mb-1">Active Logistics</h3>
        <p className="text-sm text-muted">
          {activeLogistics?.ships || 0} Ships &middot; {activeLogistics?.flights || 0} Flights &middot;{' '}
          {(activeLogistics?.trucks || 0).toLocaleString()} Trucks
        </p>
      </div>
    </div>
  )
}
