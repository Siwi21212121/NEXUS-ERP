import React from 'react'
import { Search, Bell, Briefcase, Radio } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-line">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search enterprise data..."
            className="w-full bg-panel2 border border-line rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-muted/70 focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button
          aria-label="Notifications"
          className="text-muted hover:text-white transition-colors"
        >
          <Bell size={18} />
        </button>
        <button
          aria-label="Workspaces"
          className="text-muted hover:text-white transition-colors"
        >
          <Briefcase size={18} />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-good tracking-widest uppercase">
          <Radio size={14} className="text-good" />
          Global Live
        </div>
      </div>
    </header>
  )
}
