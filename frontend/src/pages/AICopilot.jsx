import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, Bell, Bot, FileText, History, Pin, Send, Sparkles, User } from 'lucide-react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import api from '../utils/api'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function fmt(value) {
  return money.format(Number(value || 0))
}

export default function AICopilot() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      title: 'ClarioNex AI Executive Copilot',
      summary: 'Ask a business question and I will answer from ClarioNex ERP data with role-aware access.',
      insights: [],
      recommendations: [],
    },
  ])
  const [question, setQuestion] = useState('')
  const [prompts, setPrompts] = useState([])
  const [history, setHistory] = useState([])
  const [health, setHealth] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  async function loadCopilot() {
    try {
      const [healthResponse, promptsResponse, historyResponse] = await Promise.all([
        api.get('/ai/business-health'),
        api.get('/ai/suggested-prompts'),
        api.get('/ai/history'),
      ])
      setHealth(healthResponse.data.data)
      setPrompts(promptsResponse.data.data || [])
      setHistory(historyResponse.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load AI Copilot data')
    }
  }

  useEffect(() => {
    loadCopilot()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function askCopilot(event, promptText) {
    event?.preventDefault()
    const text = (promptText || question).trim()
    if (!text) return

    setQuestion('')
    setError('')
    setMessages((items) => [...items, { sender: 'user', summary: text }])
    setLoading(true)

    try {
      const response = await api.post('/ai/ask', { question: text })
      const data = response.data.data
      setMessages((items) => [...items, { sender: 'ai', ...data }])
      setHealth((current) => data.businessHealth ? { ...(current || {}), health: data.businessHealth } : current)
      await loadCopilot()
    } catch (err) {
      setError(err.response?.data?.message || 'Copilot could not answer this request')
    } finally {
      setLoading(false)
    }
  }

  async function generateReport() {
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/ai/report')
      setReport(response.data.data.report)
      setMessages((items) => [...items, { sender: 'ai', ...response.data.data }])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate executive report')
    } finally {
      setLoading(false)
    }
  }

  async function downloadReportPdf() {
    setError('')
    try {
      const response = await api.get('/ai/report.pdf', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'clarionex-executive-report.pdf'
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to download executive report PDF')
    }
  }

  const kpis = health?.kpis || {}
  const charts = health?.charts || {}
  const businessHealth = health?.health || {}
  const pinnedHistory = useMemo(() => history.slice(0, 3), [history])

  return (
    <div className="min-h-screen bg-base text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-hidden grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
          <aside className="hidden xl:flex flex-col border-r border-line bg-panel/50 min-h-0">
            <div className="p-5 border-b border-line">
              <h2 className="text-xl font-semibold flex items-center gap-2"><History size={18} />Conversations</h2>
            </div>
            <div className="p-5 border-b border-line">
              <p className="text-[11px] tracking-[3px] uppercase text-muted mb-3 flex items-center gap-2"><Pin size={14} />Pinned</p>
              <div className="space-y-2">
                {pinnedHistory.map((item) => (
                  <button key={item.id} onClick={() => setQuestion(item.question)} className="w-full text-left bg-panel2 border border-line rounded-lg p-3 text-sm hover:border-cyan/40">
                    <span className="block truncate">{item.question}</span>
                    <span className="text-xs text-muted">{item.intent}</span>
                  </button>
                ))}
                {!pinnedHistory.length && <p className="text-sm text-muted">No pinned queries yet.</p>}
              </div>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <p className="text-[11px] tracking-[3px] uppercase text-muted mb-3">Recent Queries</p>
              <div className="space-y-2">
                {history.map((item) => (
                  <button key={item.id} onClick={() => setQuestion(item.question)} className="w-full text-left rounded-lg px-3 py-2 text-sm text-muted hover:text-white hover:bg-panel2">
                    <span className="block truncate">{item.question}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex flex-col min-h-0">
            <div className="px-8 py-6 border-b border-line">
              <h1 className="text-4xl font-semibold mb-2">AI Executive Copilot</h1>
              <p className="text-muted">Role-aware decision assistant powered by PostgreSQL ERP data.</p>
            </div>

            {error && <div className="mx-8 mt-5 bg-red-950 border border-red-500/30 rounded-2xl p-4 text-red-200">{error}</div>}

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {messages.map((message, index) => (
                <ChatMessage key={`${message.sender}-${index}`} message={message} />
              ))}
              {loading && (
                <div className="flex items-center gap-3 text-muted">
                  <Bot size={18} className="text-cyan-400" />
                  <span className="animate-pulse">Analyzing ERP data...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-line px-8 py-5">
              <div className="flex flex-wrap gap-2 mb-4">
                {prompts.map((prompt) => (
                  <button key={prompt} onClick={(event) => askCopilot(event, prompt)} className="bg-panel2 border border-line rounded-full px-4 py-2 text-sm text-muted hover:text-white hover:border-cyan/40">
                    {prompt}
                  </button>
                ))}
              </div>
              <form onSubmit={askCopilot} className="flex gap-3">
                <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about revenue, inventory, payroll, vendors, approvals or business health..." className="flex-1 bg-panel border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan/50" />
                <button disabled={loading} className="bg-accent px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                  <Send size={17} />Ask
                </button>
              </form>
            </div>
          </section>

          <aside className="hidden xl:block border-l border-line bg-panel/50 overflow-y-auto">
            <div className="p-5 border-b border-line">
              <h2 className="text-xl font-semibold flex items-center gap-2"><Activity size={18} />Business Health</h2>
              <div className="mt-5 bg-panel2 rounded-2xl border border-line p-5">
                <p className="text-[11px] tracking-[3px] uppercase text-muted">Score</p>
                <h3 className="text-6xl font-light text-cyan-300 mt-2">{businessHealth.score || 0}</h3>
                <p className="text-muted text-sm mt-2">Out of 100</p>
              </div>
            </div>

            <div className="p-5 border-b border-line space-y-3">
              <h3 className="text-sm uppercase tracking-[3px] text-muted">KPIs</h3>
              <Kpi label="Revenue" value={fmt(kpis.revenue)} />
              <Kpi label="Expenses" value={fmt(kpis.expenses)} />
              <Kpi label="Profit Margin" value={`${kpis.profitMargin || 0}%`} />
              <Kpi label="Inventory Turnover" value={kpis.inventoryTurnover || 0} />
              <Kpi label="Procurement Cost" value={fmt(kpis.procurementCost)} />
            </div>

            <div className="p-5 border-b border-line">
              <h3 className="text-sm uppercase tracking-[3px] text-muted mb-4">Revenue Trend</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.revenueTrend || []}>
                    <XAxis dataKey="month" tick={{ fill: '#8a93a6', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line dataKey="revenue" stroke="#22d3ee" strokeWidth={3} dot={false} />
                    <Line dataKey="expenses" stroke="#f59e0b" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 border-b border-line">
              <h3 className="text-sm uppercase tracking-[3px] text-muted mb-4">Top Vendors</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.topVendors || []}>
                    <XAxis dataKey="name" hide />
                    <Tooltip />
                    <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <button onClick={generateReport} disabled={loading} className="w-full bg-accent rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                <FileText size={17} />Generate Monthly Report
              </button>
              <button onClick={downloadReportPdf} className="w-full bg-panel2 border border-line rounded-xl px-4 py-3 text-sm text-muted hover:text-white">
                Download PDF
              </button>
              <div className="bg-panel2 border border-line rounded-2xl p-4">
                <p className="text-sm font-semibold flex items-center gap-2"><Bell size={16} />Today's Alerts</p>
                <p className="text-muted text-sm mt-2">{report?.sections?.risks?.[0] || 'Generate a report or ask for notifications to view alerts.'}</p>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}

function ChatMessage({ message }) {
  const isUser = message.sender === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <div className="h-9 w-9 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan-300"><Bot size={18} /></div>}
      <div className={`max-w-3xl rounded-2xl border p-5 ${isUser ? 'bg-accent border-accent text-white' : 'bg-panel border-line'}`}>
        <div className="flex items-center gap-2 mb-2">
          {isUser ? <User size={16} /> : <Sparkles size={16} className="text-cyan-300" />}
          <h2 className="font-semibold">{message.title || (isUser ? 'You' : 'Copilot')}</h2>
        </div>
        <p className="text-sm leading-6 whitespace-pre-wrap">{message.summary || message.answer}</p>
        {!!message.insights?.length && <MessageList title="Insights" items={message.insights} />}
        {!!message.recommendations?.length && <MessageList title="Recommendations" items={message.recommendations} />}
      </div>
    </div>
  )
}

function MessageList({ title, items }) {
  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-[3px] text-muted mb-2">{title}</p>
      <div className="space-y-2">
        {items.map((item) => <p key={item} className="text-sm text-muted bg-panel2 rounded-lg px-3 py-2">{item}</p>)}
      </div>
    </div>
  )
}

function Kpi({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
