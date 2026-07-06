import React, { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BrainCircuit, Lightbulb, Send, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import api from '../utils/api'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function formatValue(value) {
  const number = Number(value || 0)
  if (Math.abs(number) >= 10000) return money.format(number)
  return number.toLocaleString('en-US')
}

export default function DashboardAIPanel({ moduleKey, refreshKey }) {
  const [intelligence, setIntelligence] = useState(null)
  const [scenario, setScenario] = useState('')
  const [simulation, setSimulation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [error, setError] = useState('')

  async function loadIntelligence() {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/intelligence/${moduleKey}`)
      setIntelligence(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load enterprise intelligence')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIntelligence()
  }, [moduleKey, refreshKey])

  async function runSimulation(event) {
    event.preventDefault()
    if (!scenario.trim()) return
    try {
      setSimulating(true)
      setError('')
      const response = await api.post(`/intelligence/${moduleKey}/simulate`, { scenario })
      setSimulation(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to run simulation')
    } finally {
      setSimulating(false)
    }
  }

  const health = intelligence?.businessHealth || {}
  const topPrediction = useMemo(() => intelligence?.predictions?.[0], [intelligence])

  return (
    <section className="bg-panel border border-line rounded-2xl overflow-hidden mb-6">
      <div className="p-5 border-b border-line flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BrainCircuit size={21} className="text-cyan-300" />
            Enterprise Intelligence
          </h2>
          <p className="text-muted text-sm mt-1">Observes, analyzes, explains, predicts, recommends, simulates, alerts and learns from this dashboard.</p>
        </div>
        <div className="bg-panel2 border border-line rounded-xl px-4 py-3 text-right">
          <p className="text-[10px] tracking-[3px] uppercase text-muted">Health</p>
          <p className="text-3xl font-light text-cyan-300">{health.score || 0}<span className="text-sm text-muted">/100</span></p>
        </div>
      </div>

      {loading && <div className="p-5 text-muted">Analyzing live ERP context...</div>}
      {error && <div className="m-5 bg-red-950 border border-red-500/30 rounded-xl p-4 text-red-200">{error}</div>}

      {intelligence && (
        <div className="p-5 grid grid-cols-1 xl:grid-cols-4 gap-5">
          <Panel icon={Sparkles} title="Dashboard Summary">
            <p className="text-sm text-muted leading-6">{intelligence.dashboardSummary}</p>
            <p className="text-xs text-muted mt-3">Confidence: {health.confidence || 0}% | Sources: {(intelligence.context?.dataSources || []).length}</p>
          </Panel>

          <Panel icon={TrendingUp} title="Predictions">
            {topPrediction ? (
              <div>
                <p className="text-sm text-muted">{topPrediction.key}</p>
                <p className="text-2xl mt-2">{formatValue(topPrediction.prediction)}</p>
                <p className="text-xs text-muted mt-2">{topPrediction.model} | {topPrediction.confidence}% confidence | {topPrediction.trend}</p>
              </div>
            ) : (
              <p className="text-sm text-muted">More historical records are needed for a confident forecast.</p>
            )}
          </Panel>

          <Panel icon={AlertTriangle} title="Business Risks">
            <List items={intelligence.risks} pick={(item) => `${item.severity}: ${item.message}`} />
          </Panel>

          <Panel icon={Lightbulb} title="Opportunities">
            <List items={intelligence.opportunities} pick={(item) => item.message} />
          </Panel>

          <Panel icon={ShieldCheck} title="Recommended Actions">
            <List items={intelligence.recommendations} pick={(item) => `${item.priority}: ${item.action}`} />
          </Panel>

          <Panel icon={Sparkles} title="Explainability">
            <List items={intelligence.explanations} pick={(item) => `${item.key}: ${item.whyItMatters}`} />
          </Panel>

          <Panel icon={AlertTriangle} title="Recent Alerts">
            <List items={intelligence.alerts} pick={(item) => `${item.severity}: ${item.message}`} empty="No active alerts from current data." />
          </Panel>

          <Panel icon={BrainCircuit} title="What-If Simulation">
            <form onSubmit={runSimulation} className="space-y-3">
              <input value={scenario} onChange={(event) => setScenario(event.target.value)} placeholder="What happens if expenses increase by 15%?" className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm" />
              <button disabled={simulating} className="bg-accent rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                <Send size={15} />Simulate
              </button>
            </form>
            {simulation && (
              <div className="mt-4 bg-panel2 border border-line rounded-xl p-3 text-sm">
                <p className="text-muted mb-2">{simulation.recommendation}</p>
                <p>Profit: {formatValue(simulation.projection?.profit)}</p>
                <p>Health: {simulation.projection?.businessHealth}/100</p>
              </div>
            )}
          </Panel>
        </div>
      )}
    </section>
  )
}

function Panel({ icon: Icon, title, children }) {
  return (
    <div className="bg-panel2 border border-line rounded-xl p-4 min-h-[190px]">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Icon size={16} className="text-cyan-300" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function List({ items, pick, empty = 'No records found.' }) {
  if (!items?.length) return <p className="text-sm text-muted">{empty}</p>
  return (
    <div className="space-y-2 max-h-36 overflow-y-auto">
      {items.slice(0, 4).map((item, index) => (
        <p key={`${pick(item)}-${index}`} className="text-sm text-muted leading-5">{pick(item)}</p>
      ))}
    </div>
  )
}
