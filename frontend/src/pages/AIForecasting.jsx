import React from 'react'
import {
  BrainCircuit,
  Activity,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AIAssistant from '../components/AIAssistant'

import {
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

const predictionData = [
  { value: 30 },
  { value: 48 },
  { value: 40 },
  { value: 72 },
  { value: 84 },
  { value: 66 },
  { value: 92 },
]

function ForecastCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
}) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex justify-between items-start mb-5">
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

          <p className="text-sm text-muted mt-2">
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
            width: '72%',
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export default function AIForecasting() {
  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-8 py-7">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-semibold mb-3">
              Command Center
            </h1>

            <p className="text-muted text-lg max-w-4xl">
              Deep learning forecasting model
              currently processing enterprise
              intelligence and operational signals.
            </p>
          </div>

          {/* Top Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <ForecastCard
              icon={Activity}
              title="Forecast Accuracy"
              value="94.2%"
              subtitle="+1.4% from last cycle"
              color="#67e8f9"
            />

            <ForecastCard
              icon={TrendingUp}
              title="Predicted Growth"
              value="$12.4M"
              subtitle="Q3 Projection Adjusted"
              color="#38bdf8"
            />

            <ForecastCard
              icon={ShieldCheck}
              title="System Confidence"
              value="High"
              subtitle="Highly Significant"
              color="#c084fc"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Demand Prediction */}
            <div className="bg-panel border border-line rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <BrainCircuit
                  className="text-cyan-400"
                  size={24}
                />

                <h2 className="text-3xl font-semibold">
                  Demand Prediction Cluster
                </h2>
              </div>

              <div className="h-[320px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart data={predictionData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#67e8f9"
                      strokeWidth={4}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Anomaly Engine */}
            <div className="bg-panel border border-line rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle
                  className="text-red-400"
                  size={24}
                />

                <h2 className="text-3xl font-semibold">
                  Anomaly Engine
                </h2>
              </div>

              <div className="space-y-5">
                <div className="bg-panel2 border border-line rounded-xl p-5">
                  <h3 className="text-red-400 font-semibold mb-2">
                    Unexpected spike in APAC demand
                  </h3>

                  <p className="text-muted">
                    Consumer electronics sector
                    showing 15% deviation from
                    seasonal norms.
                  </p>
                </div>

                <div className="bg-panel2 border border-line rounded-xl p-5">
                  <h3 className="text-cyan-400 font-semibold mb-2">
                    Logistics delay in North Sea
                  </h3>

                  <p className="text-muted">
                    Shipping routes experiencing
                    temporary disruption.
                  </p>
                </div>

                <div className="bg-panel2 border border-line rounded-xl p-5">
                  <h3 className="text-violet-400 font-semibold mb-2">
                    AI Recommendation
                  </h3>

                  <p className="text-muted">
                    Increase supply buffer by 12%
                    for Q4 demand stability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AIAssistant />
    </div>
  )
}