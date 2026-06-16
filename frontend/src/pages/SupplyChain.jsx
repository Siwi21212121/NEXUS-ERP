import React from 'react'
import {
  Warehouse,
  Truck,
  CircleCheck,
  ClipboardList,
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AIAssistant from '../components/AIAssistant'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

const forecastData = [
  { value: 50 },
  { value: 44 },
  { value: 72 },
  { value: 84 },
  { value: 79 },
  { value: 41 },
  { value: 53 },
]

const vendors = [
  {
    name: 'GigaDynamics Corp',
    location: 'Silicon Valley, US',
    rating: '★★★★★',
    pos: '12 ($450k)',
  },
  {
    name: 'NeoLogistics Ltd',
    location: 'Berlin, DE',
    rating: '★★★★☆',
    pos: '8 ($210k)',
  },
]

const purchaseOrders = [
  {
    id: 'PO-88219',
    item: 'Quantum Chips (x500)',
    amount: '$84,200',
    status: 'IN TRANSIT',
  },
  {
    id: 'PO-88220',
    item: 'Heatsink Assembly',
    amount: '$12,500',
    status: 'DRAFT',
  },
  {
    id: 'PO-88195',
    item: 'Grade-A Copper',
    amount: '$102,000',
    status: 'RECEIVED',
  },
]

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
}) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex justify-between items-start mb-4">
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

          <p className="text-muted text-sm mt-2">
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
            width: '70%',
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export default function SupplyChain() {
  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-8 py-7">
          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
            <MetricCard
              icon={Warehouse}
              title="Warehouse Utilization"
              value="84%"
              subtitle="-2.1%"
              color="#38bdf8"
            />

            <MetricCard
              icon={Truck}
              title="Active Shipments"
              value="142"
              subtitle="On-Time"
              color="#94a3b8"
            />

            <MetricCard
              icon={CircleCheck}
              title="Stock Health"
              value="Optimal"
              subtitle="Stable"
              color="#22c55e"
            />

            <MetricCard
              icon={ClipboardList}
              title="Pending POs"
              value="$1.2M"
              subtitle="24 Open"
              color="#c084fc"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Warehouse */}
            <div className="xl:col-span-2 bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-line">
                <h2 className="text-4xl font-semibold mb-2">
                  Warehouse Overview
                </h2>

                <p className="text-muted">
                  Global stock levels across strategic hubs
                </p>
              </div>

              <div className="p-6 grid lg:grid-cols-3 gap-5">
                <div className="space-y-4">
                  <div className="bg-panel2 rounded-xl p-5 border border-line">
                    <p className="text-muted text-sm">
                      HUB: NEW JERSEY
                    </p>

                    <h2 className="text-4xl font-light mt-3">
                      92%
                    </h2>

                    <p className="text-red-400 text-sm mt-2">
                      Critical Over-capacity
                    </p>
                  </div>

                  <div className="bg-panel2 rounded-xl p-5 border border-line">
                    <p className="text-muted text-sm">
                      HUB: LOS ANGELES
                    </p>

                    <h2 className="text-4xl font-light mt-3">
                      64%
                    </h2>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-panel2 rounded-xl border border-line flex items-center justify-center min-h-[320px]">
                  <h2 className="text-muted text-xl">
                    Global Logistics Map
                  </h2>
                </div>
              </div>
            </div>

            {/* Forecast */}
            <div className="bg-panel border border-line rounded-2xl p-6">
              <h2 className="text-4xl font-semibold mb-2">
                Forecast
              </h2>

              <p className="text-muted mb-6">
                AI Predicted Demand
              </p>

              <div className="h-[280px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={forecastData}>
                    <Bar
                      dataKey="value"
                      radius={[10, 10, 0, 0]}
                      fill="#67e8f9"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-5 bg-red-950 border border-red-500/30 rounded-xl p-5">
                <h3 className="text-red-300 font-semibold mb-2">
                  STOCKOUT ALERT: SKU-990
                </h3>

                <p className="text-red-200 text-sm">
                  High probability of depletion in 12
                  days.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Vendors */}
            <div className="xl:col-span-2 bg-panel border border-line rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-line">
                <h2 className="text-4xl font-semibold">
                  Vendor Management
                </h2>
              </div>

              <div className="divide-y divide-line">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.name}
                    className="p-6 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-xl font-medium">
                        {vendor.name}
                      </h3>

                      <p className="text-muted">
                        {vendor.location}
                      </p>
                    </div>

                    <div>
                      <p>{vendor.rating}</p>
                    </div>

                    <div>
                      <p>{vendor.pos}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Orders */}
            <div className="bg-panel border border-line rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-semibold">
                  Open POs
                </h2>

                <button className="bg-accent px-4 py-2 rounded-lg text-sm">
                  + NEW
                </button>
              </div>

              <div className="space-y-4">
                {purchaseOrders.map((po) => (
                  <div
                    key={po.id}
                    className="bg-panel2 border border-line rounded-xl p-5"
                  >
                    <div className="flex justify-between mb-3">
                      <span className="text-muted">
                        {po.id}
                      </span>

                      <span className="text-cyan-400 text-xs">
                        {po.status}
                      </span>
                    </div>

                    <h3 className="font-medium">
                      {po.item}
                    </h3>

                    <p className="text-muted mt-3">
                      {po.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <AIAssistant />
    </div>
  )
}