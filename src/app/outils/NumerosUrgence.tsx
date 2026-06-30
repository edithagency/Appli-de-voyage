'use client'

import { useState } from 'react'

export type PaysOutil = {
  code: string
  nom_fr: string
  emoji: string | null
  urgence_police: string | null
  urgence_ambulance: string | null
  urgence_ambassade_france: string | null
  urgence_autres: { label: string; numero: string }[] | null
  ambassade_info: { adresse?: string; tel_urgence?: string } | null
  sante_details: { trousse_medicale?: string[] } | null
  phrases_essentielles: { fr: string; langue_locale: string; phonetique: string }[] | null
}

export default function NumerosUrgence({ pays, defaultPaysCode }: { pays: PaysOutil[]; defaultPaysCode?: string | null }) {
  const [code, setCode] = useState(defaultPaysCode ?? pays[0]?.code ?? '')
  const p = pays.find(x => x.code === code) ?? null

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-bold text-gray-800 text-lg">🚨 Numéros d&apos;urgence</h2>

      <select value={code} onChange={e => setCode(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#36A6B2]">
        {pays.map(x => <option key={x.code} value={x.code}>{x.emoji} {x.nom_fr}</option>)}
      </select>

      {p && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Police', number: p.urgence_police, emoji: '🚔' },
              { label: 'Ambulance', number: p.urgence_ambulance, emoji: '🚑' },
              { label: 'Ambassade', number: p.urgence_ambassade_france, emoji: '🇫🇷' },
            ].map(u => (
              <div key={u.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 text-center">
                <span className="text-2xl">{u.emoji}</span>
                <span className="text-xs text-gray-400 leading-tight">{u.label}</span>
                <span className="text-sm font-bold text-gray-800 break-all">{u.number ?? '–'}</span>
              </div>
            ))}
          </div>
          {Array.isArray(p.urgence_autres) && p.urgence_autres.length > 0 && (
            <div className="flex flex-col">
              {p.urgence_autres.map((u, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{u.label}</span>
                  <span className="text-sm font-semibold text-gray-800">{u.numero}</span>
                </div>
              ))}
            </div>
          )}
          {p.ambassade_info?.adresse && (
            <div className="bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-xs font-semibold text-gray-700 mb-0.5">🇫🇷 Ambassade de France</p>
              <p className="text-xs text-gray-500 leading-relaxed">{p.ambassade_info.adresse}</p>
              {p.ambassade_info.tel_urgence && <p className="text-xs text-gray-500 leading-relaxed mt-1">Urgence consulaire : {p.ambassade_info.tel_urgence}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
