'use client'

import { useEffect, useState, useRef } from 'react'

const VILLES = [
  { label: 'Londres',       tz: 'Europe/London' },
  { label: 'Lisbonne',      tz: 'Europe/Lisbon' },
  { label: 'Madrid',        tz: 'Europe/Madrid' },
  { label: 'Marrakech',     tz: 'Africa/Casablanca' },
  { label: 'Tunis',         tz: 'Africa/Tunis' },
  { label: 'Le Caire',      tz: 'Africa/Cairo' },
  { label: 'Dakar',         tz: 'Africa/Dakar' },
  { label: 'Nairobi',       tz: 'Africa/Nairobi' },
  { label: 'Johannesburg',  tz: 'Africa/Johannesburg' },
  { label: 'Moscou',        tz: 'Europe/Moscow' },
  { label: 'Istanbul',      tz: 'Europe/Istanbul' },
  { label: 'Dubaï',         tz: 'Asia/Dubai' },
  { label: 'Mumbai',        tz: 'Asia/Kolkata' },
  { label: 'Bangkok',       tz: 'Asia/Bangkok' },
  { label: 'Bali',          tz: 'Asia/Makassar' },
  { label: 'Singapour',     tz: 'Asia/Singapore' },
  { label: 'Hong Kong',     tz: 'Asia/Hong_Kong' },
  { label: 'Pékin',         tz: 'Asia/Shanghai' },
  { label: 'Tokyo',         tz: 'Asia/Tokyo' },
  { label: 'Séoul',         tz: 'Asia/Seoul' },
  { label: 'Sydney',        tz: 'Australia/Sydney' },
  { label: 'Auckland',      tz: 'Pacific/Auckland' },
  { label: 'New York',      tz: 'America/New_York' },
  { label: 'Montréal',      tz: 'America/Toronto' },
  { label: 'Chicago',       tz: 'America/Chicago' },
  { label: 'Los Angeles',   tz: 'America/Los_Angeles' },
  { label: 'Mexico',        tz: 'America/Mexico_City' },
  { label: 'São Paulo',     tz: 'America/Sao_Paulo' },
  { label: 'Buenos Aires',  tz: 'America/Argentina/Buenos_Aires' },
]

const ICI = { label: 'Paris', tz: 'Europe/Paris' }

function formatHeure(date: Date, tz: string) {
  return date.toLocaleTimeString('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatJour(date: Date, tz: string) {
  return date.toLocaleDateString('fr-FR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' })
}

function getOffset(date: Date, tz: string): number {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' })
  const tzStr  = date.toLocaleString('en-US', { timeZone: tz })
  return (new Date(tzStr).getTime() - new Date(utcStr).getTime()) / (1000 * 60 * 60)
}

function savedDest() {
  if (typeof window === 'undefined') return null
  const tz = localStorage.getItem('horaire_dest_tz')
  const label = localStorage.getItem('horaire_dest_label')
  return tz && label ? { tz, label } : null
}

export default function DecalageHoraire() {
  const [now, setNow]       = useState(new Date())
  const [dest, setDest]     = useState(() => savedDest() ?? { tz: 'Asia/Bangkok', label: 'Bangkok' })
  const [editing, setEditing] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (editing) setTimeout(() => inputRef.current?.focus(), 30)
  }, [editing])

  function selectDest(v: typeof VILLES[0]) {
    setDest(v)
    localStorage.setItem('horaire_dest_tz', v.tz)
    localStorage.setItem('horaire_dest_label', v.label)
    setEditing(false)
    setSearch('')
  }

  const filtered = search.trim()
    ? VILLES.filter(v => v.label.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : []

  const diff = getOffset(now, dest.tz) - getOffset(now, ICI.tz)
  const diffLabel = diff === 0 ? 'Même fuseau' : diff > 0 ? `+${diff}h` : `${diff}h`
  const diffColor = diff === 0
    ? { bg: '#F3F4F6', text: '#6B7280' }
    : { bg: '#e7f8ce', text: '#2D5A1B' }

  return (
    <div className="flex flex-col gap-4">
      {/* Les deux horloges */}
      <div className="grid grid-cols-2 gap-3">
        {/* Ici — France fixe */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-0.5">
          <p className="text-xs text-gray-400 font-medium mb-1">🇫🇷 Ici</p>
          <p className="text-2xl font-bold tabular-nums leading-none" style={{ color: '#36A6B2' }}>
            {formatHeure(now, ICI.tz)}
          </p>
          <p className="text-xs font-semibold text-gray-700 mt-1">{ICI.label}</p>
          <p className="text-xs text-gray-400 capitalize leading-tight">{formatJour(now, ICI.tz)}</p>
        </div>

        {/* Là-bas — destination cliquable */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-0.5">
          <p className="text-xs text-gray-400 font-medium mb-1">✈️ Là-bas</p>
          <p className="text-2xl font-bold tabular-nums leading-none text-gray-800">
            {formatHeure(now, dest.tz)}
          </p>
          <div className="mt-1">
            {editing ? (
              <input
                ref={inputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onBlur={() => setTimeout(() => { setEditing(false); setSearch('') }, 150)}
                placeholder="Chercher une ville…"
                className="text-xs font-semibold text-gray-800 bg-transparent border-b border-[#36A6B2] focus:outline-none w-full pb-0.5"
              />
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-semibold text-left flex items-center gap-1"
                style={{ color: '#36A6B2' }}
              >
                {dest.label}
                <span className="text-gray-300 text-[10px]">✎</span>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 capitalize leading-tight">{formatJour(now, dest.tz)}</p>
        </div>
      </div>

      {/* Liste de recherche */}
      {editing && filtered.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
          {filtered.map(v => (
            <button key={v.tz} type="button"
              onMouseDown={() => selectDest(v)}
              className="w-full flex items-center px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0 text-gray-800">
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* Badge décalage */}
      <div className="flex justify-center">
        <span className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ background: diffColor.bg, color: diffColor.text }}>
          {diffLabel} par rapport à la France
        </span>
      </div>
    </div>
  )
}
