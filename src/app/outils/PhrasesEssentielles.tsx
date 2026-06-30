'use client'

import { useState } from 'react'
import type { PaysOutil } from './NumerosUrgence'

export default function PhrasesEssentielles({ pays, defaultPaysCode }: { pays: PaysOutil[]; defaultPaysCode?: string | null }) {
  const [code, setCode] = useState(defaultPaysCode ?? pays[0]?.code ?? '')
  const p = pays.find(x => x.code === code) ?? null
  const phrases = p?.phrases_essentielles ?? []

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-bold text-gray-800 text-lg">🗣️ Phrases essentielles</h2>

      <select value={code} onChange={e => setCode(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#36A6B2]">
        {pays.map(x => <option key={x.code} value={x.code}>{x.emoji} {x.nom_fr}</option>)}
      </select>

      {phrases.length > 0 ? (
        <div className="flex flex-col">
          {phrases.map((p2, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400 w-20 shrink-0">{p2.fr}</span>
              <span className="text-sm font-semibold text-gray-800 flex-1 text-center">{p2.langue_locale}</span>
              <span className="text-xs text-gray-400 italic w-20 text-right shrink-0">{p2.phonetique}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">Pas de phrases disponibles pour ce pays.</p>
      )}
    </div>
  )
}
