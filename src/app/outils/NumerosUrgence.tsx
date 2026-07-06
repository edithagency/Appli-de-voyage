'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'

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
  budget_estimations?: Record<string, Record<string, number>> | null
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function NumerosUrgence({ pays, defaultPaysCode }: { pays: PaysOutil[]; defaultPaysCode?: string | null }) {
  const defaultPays = pays.find(x => x.code === defaultPaysCode) ?? null
  const [code, setCode] = useState(defaultPaysCode ?? '')
  const [search, setSearch] = useState(defaultPays ? `${defaultPays.emoji} ${defaultPays.nom_fr}` : '')
  const [showDropdown, setShowDropdown] = useState(false)

  const paysFiltered = pays.filter(p =>
    norm(p.nom_fr).includes(norm(search))
  ).slice(0, 6)

  function handleSelect(p: PaysOutil) {
    setCode(p.code)
    setSearch(`${p.emoji} ${p.nom_fr}`)
    setShowDropdown(false)
  }

  const p = pays.find(x => x.code === code) ?? null

  return (
    <div className="flex flex-col gap-3" style={{ minHeight: 220 }}>
      <div className="relative">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Destination</p>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowDropdown(true); setCode('') }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Rechercher un pays..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
        />
        {showDropdown && search.length > 0 && paysFiltered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            {paysFiltered.map(p => (
              <button
                key={p.code}
                type="button"
                onMouseDown={() => handleSelect(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm"
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-gray-800">{p.nom_fr}</span>
                {code === p.code && <span className="ml-auto text-[#36A6B2]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {p && (
        <div className="flex flex-col gap-2">
          {[
            { label: 'Police', number: p.urgence_police, emoji: '🚔' },
            { label: 'Ambulance', number: p.urgence_ambulance, emoji: '🚑' },
            { label: 'Ambassade FR', number: p.urgence_ambassade_france, emoji: '🇫🇷' },
          ].map(u => u.number ? (
            <a key={u.label} href={`tel:${u.number}`}
              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 active:bg-gray-100 transition">
              <span className="text-sm text-gray-700 font-medium">{u.emoji} {u.label}</span>
              <span className="flex items-center gap-2">
                <span className="text-base font-bold text-[#004850]">{u.number}</span>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#36A6B2]">
                  <Phone size={15} color="white" />
                </span>
              </span>
            </a>
          ) : (
            <div key={u.label} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50">
              <span className="text-sm text-gray-400">{u.emoji} {u.label}</span>
              <span className="text-sm text-gray-300 font-bold">–</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
