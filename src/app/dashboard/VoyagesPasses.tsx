'use client'

import { useState } from 'react'
import Link from 'next/link'

type VoyagePasse = {
  id: string
  nom: string
  destination: string
  date_depart: string
  date_retour: string
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function VoyagesPasses({ voyages }: { voyages: VoyagePasse[] }) {
  const [open, setOpen] = useState(false)

  if (voyages.length === 0) return null

  return (
    <div className="mt-6">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 text-sm font-semibold text-gray-400 hover:text-gray-600 transition py-2">
        <span>🗂️ Voyages passés ({voyages.length})</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M2 4.5L7 9.5L12 4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="flex flex-col gap-2 mt-2">
          {voyages.map(v => (
            <Link key={v.id} href={`/voyage/${v.id}`}
              className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 opacity-70 hover:opacity-100 transition">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">{v.nom}</p>
                <p className="text-xs text-gray-400 truncate">
                  {v.destination} · {formatDate(v.date_depart)} - {formatDate(v.date_retour)}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 shrink-0">
                Terminé
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
