import React from 'react'
import { TrendingUp } from 'lucide-react'
import { inventoryStatus } from '../data/mockData.js'

export default function InventoryStatus() {
  const inventoryItems = Array.isArray(inventoryStatus)
    ? inventoryStatus
    : []

  return (
    <div className="bg-panel border border-line rounded-xl2 p-5 flex flex-col gap-4">
      <h3 className="text-base font-semibold">Inventory Status</h3>

      <div className="flex flex-col gap-4">
        {inventoryItems.map((item) => (
          <div key={item?.label}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted">{item?.label || 'Inventory'}</span>
              <span className="font-semibold">{item?.value || 0}% Capacity</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-panel2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${item?.value || 0}%`, backgroundColor: item?.color || '#3a4150' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-line">
        <span className="text-sm text-muted">Global Stock Index</span>
        <span className="flex items-center gap-1 text-sm font-semibold text-good">
          <TrendingUp size={14} />
          Stable
        </span>
      </div>
    </div>
  )
}
