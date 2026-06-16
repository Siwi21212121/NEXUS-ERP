import React from 'react'
import { MessageSquare, Sparkles } from 'lucide-react'
import { aiMessages, aiRecommendation } from '../data/mockData.js'

export default function AIAssistant() {
  const messages = Array.isArray(aiMessages) ? aiMessages : []
  const recommendation = aiRecommendation || 'No recommendation available.'

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-line px-5 py-6 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-cyan flex items-center gap-1.5">
            <Sparkles size={14} />
            AI Assistant
          </h3>
          <p className="text-xs text-muted">Always Active</p>
        </div>
        <button aria-label="Open chat" className="text-muted hover:text-white transition-colors">
          <MessageSquare size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg?.id || msg?.time} className="bg-panel2 border border-line rounded-lg p-4">
            <p className="text-xs text-muted mb-1.5">
              {msg?.sender || 'Nexus AI'} &middot; {msg?.time || 'Now'}
            </p>
            <p className="text-sm leading-relaxed">{msg?.body || 'No message available.'}</p>
          </div>
        ))}

        <div className="bg-cyan/10 border border-cyan/30 rounded-lg p-4">
          <p className="text-xs font-semibold text-cyan mb-1.5">Executive Recommendation</p>
          <p className="text-sm leading-relaxed text-white/90">&quot;{recommendation}&quot;</p>
        </div>
      </div>
    </aside>
  )
}
