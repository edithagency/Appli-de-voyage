'use client'

import { useState } from 'react'
import type { PaysOutil } from './NumerosUrgence'

export default function TrousseMedicale({ pays, defaultPaysCode }: { pays: PaysOutil[]; defaultPaysCode?: string | null }) {
  const [code, setCode] = useState(defaultPaysCode ?? pays[0]?.code ?? '')
  const p = pays.find(x => x.code === code) ?? null
  const trousse = p?.sante_details?.trousse_medicale ?? []

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-bold text-gray-800 text-lg">💊 Trousse médicale</h2>

      <select value={code} onChange={e => setCode(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#36A6B2]">
        {pays.map(x => <option key={x.code} value={x.code}>{x.emoji} {x.nom_fr}</option>)}
      </select>

      {trousse.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {trousse.map((item, i) => (
            <li key={i} className="text-xs text-gray-600 leading-relaxed flex gap-2">
              <span className="text-gray-400">•</span><span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">Pas de recommandations spécifiques pour ce pays.</p>
      )}
    </div>
  )
}
