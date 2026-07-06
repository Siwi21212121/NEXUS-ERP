import React, { useState } from 'react'
import { AlertTriangle, ExternalLink, MessageSquare, Send, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'

export default function AIAssistant() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'ClarioNex AI',
      body: 'Ask about this dashboard, finance, HR, supply chain, procurement, analytics, or business health.',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState('')

  async function askAssistant(event) {
    event.preventDefault()
    const text = question.trim()
    if (!text) return

    setQuestion('')
    setTicket(null)
    setError('')
    setMessages((items) => [...items, { sender: 'You', body: text }])
    setLoading(true)

    try {
      const response = await api.post('/ai/ask', { question: text })
      const data = response.data.data
      const body = buildAssistantBody(data)
      setMessages((items) => [
        ...items,
        {
          sender: 'ClarioNex AI',
          body,
        },
      ])
      if (shouldEscalate(data)) {
        await raiseTicket(text, data.summary || 'Copilot could not find enough data to resolve this query.')
      }
    } catch (err) {
      const reason = err.response?.data?.message || 'Copilot could not resolve this query from your accessible ERP context.'
      setError(reason)
      await raiseTicket(text, reason)
    } finally {
      setLoading(false)
    }
  }

  async function raiseTicket(text = question, reason = 'User requested escalation') {
    const cleanText = text.trim()
    if (!cleanText) return
    try {
      const response = await api.post('/ai/tickets', { question: cleanText, reason })
      setTicket(response.data.data)
      setMessages((items) => [
        ...items,
        {
          sender: 'Support Desk',
          body: `Ticket ${response.data.data.ticketNumber} raised to ${response.data.data.department}.`,
        },
      ])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to raise support ticket')
    }
  }

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-line px-5 py-6 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-cyan flex items-center gap-1.5">
            <Sparkles size={14} />
            AI Assistant
          </h3>
          <p className="text-xs text-muted">Copilot connected</p>
        </div>
        <button onClick={() => navigate('/ai-copilot')} aria-label="Open AI Copilot" className="text-muted hover:text-white transition-colors">
          <ExternalLink size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div key={`${msg.sender}-${msg.body}`} className="bg-panel2 border border-line rounded-lg p-4">
            <p className="text-xs text-muted mb-1.5">
              {msg?.sender || 'ClarioNex AI'} &middot; Now
            </p>
            <p className="text-sm leading-relaxed">{msg?.body || 'No message available.'}</p>
          </div>
        ))}

        {loading && (
          <div className="bg-panel2 border border-line rounded-lg p-4 text-sm text-muted">
            Analyzing ERP data...
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-500/30 rounded-lg p-4">
            <p className="text-xs font-semibold text-red-200 mb-1.5 flex items-center gap-1">
              <AlertTriangle size={13} />
              Escalation
            </p>
            <p className="text-sm text-red-100 leading-relaxed">{error}</p>
          </div>
        )}

        {ticket && (
          <div className="bg-cyan/10 border border-cyan/30 rounded-lg p-4">
            <p className="text-xs font-semibold text-cyan mb-1.5">Ticket Raised</p>
            <p className="text-sm leading-relaxed text-white/90">{ticket.ticketNumber} is assigned to {ticket.department}.</p>
          </div>
        )}

        <div className="bg-cyan/10 border border-cyan/30 rounded-lg p-4">
          <p className="text-xs font-semibold text-cyan mb-1.5">Need deeper help?</p>
          <button onClick={() => navigate('/ai-copilot')} className="text-sm leading-relaxed text-white/90 flex items-center gap-2">
            <MessageSquare size={15} />
            Open full AI Copilot
          </button>
        </div>
      </div>

      <form onSubmit={askAssistant} className="mt-auto space-y-3">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask AI or describe an issue..."
          className="w-full min-h-[88px] bg-panel2 border border-line rounded-lg px-3 py-2 text-sm resize-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <button disabled={loading} className="bg-accent rounded-lg px-3 py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            <Send size={15} />
            Ask
          </button>
          <button type="button" onClick={() => raiseTicket(question)} disabled={!question.trim()} className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-muted hover:text-white disabled:opacity-40">
            Raise Ticket
          </button>
        </div>
      </form>
    </aside>
  )
}

function buildAssistantBody(data) {
  const sections = []
  if (data?.summary) sections.push(data.summary)
  if (data?.insights?.length) {
    sections.push(`Insights: ${data.insights.slice(0, 2).join(' ')}`)
  }
  if (data?.recommendations?.length) {
    sections.push(`Recommended action: ${data.recommendations[0]}`)
  }
  if (data?.businessHealth?.score !== undefined) {
    sections.push(`Business health: ${data.businessHealth.score}/100.`)
  }
  return sections.join('\n\n') || data?.answer || 'I analyzed the available ERP data.'
}

function shouldEscalate(data) {
  const text = `${data?.summary || ''} ${data?.answer || ''}`.toLowerCase()
  return text.includes('not available yet') ||
    text.includes('no matching postgresql records') ||
    text.includes('not enough data')
}
