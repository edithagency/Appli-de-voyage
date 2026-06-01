'use client'

import { useState } from 'react'

export default function CollapsibleSection({
  title, children, defaultOpen = false
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition">
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M2 4.5L7 9.5L12 4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="border-t border-gray-50 px-6 pb-6 pt-5">
          {children}
        </div>
      )}
    </div>
  )
}
