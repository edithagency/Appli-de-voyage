'use client'

import { useEffect, useState, useRef } from 'react'

const VILLES = [
  { label: 'Paris',         tz: 'Europe/Paris' },
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

type Ville = typeof VILLES[0]
type Side = 1 | 2 | null

function load(key: string, fallback: Ville): Ville {
  if (typeof window === 'undefined') return fallback
  const tz    = localStorage.getItem(key + '_tz')
  const label = localStorage.getItem(key + '_label')
  return tz && label ? { tz, label } : fallback
}

function save(key: string, v: Ville) {
  localStorage.setItem(key + '_tz',    v.tz)
  localStorage.setItem(key + '_label', v.label)
}

function formatHeure(date: Date, tz: string) {
  return date.toLocaleTimeString('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatJour(date: Date, tz: string) {
  return date.toLocaleDateString('fr-FR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' })
}

function getOffset(date: Date, tz: string): number {
  const u = date.toLocaleString('en-US', { timeZone: 'UTC' })
  const t = date.toLocaleString('en-US', { timeZone: tz })
  return (new Date(t).getTime() - new Date(u).getTime()) / 3600000
}

export default function DecalageHoraire() {
  const [now,    setNow]    = useState(new Date())
  const [city1,  setCity1]  = useState<Ville>(() => load('horaire_1', { label: 'Paris',   tz: 'Europe/Paris' }))
  const [city2,  setCity2]  = useState<Ville>(() => load('horaire_2', { label: 'Bangkok', tz: 'Asia/Bangkok' }))
  const [active, setActive] = useState<Side>(null)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (active) {
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [active])

  function selectVille(v: Ville) {
    if (active === 1) { setCity1(v); save('horaire_1', v) }
    else              { setCity2(v); save('horaire_2', v) }
    setActive(null)
    setSearch('')
  }

  const filtered = search.trim()
    ? VILLES.filter(v => v.label.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : []

  const diff = getOffset(now, city2.tz) - getOffset(now, city1.tz)
  const diffLabel = diff === 0 ? 'Même fuseau' : diff > 0 ? `+${diff}h` : `${diff}h`
  const diffColor = diff === 0
    ? { bg: '#F3F4F6', text: '#6B7280' }
    : { bg: '#e7f8ce', text: '#2D5A1B' }

  function ClockCard({ city, side }: { city: Ville; side: Side }) {
    const isActive = active === side
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-1">
        <button
          onClick={() => setActive(isActive ? null : side)}
          className="self-start flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all"
          style={{
            background: isActive ? '#004850' : '#F3F4F6',
            color:      isActive ? 'white'   : '#374151',
          }}
        >
          {city.label}
          <span className="opacity-50 text-[10px]">{isActive ? '▲' : '▼'}</span>
        </button>
        <p className="text-2xl font-bold tabular-nums leading-none mt-2"
          style={{ color: side === 1 ? '#36A6B2' : '#1a2e2f' }}>
          {formatHeure(now, city.tz)}
        </p>
        <p className="text-xs text-gray-400 capitalize leading-tight">{formatJour(now, city.tz)}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <ClockCard city={city1} side={1} />
        <ClockCard city={city2} side={2} />
      </div>

      {/* Recherche inline */}
      {active && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-3 pt-3 pb-2">
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onBlur={() => setTimeout(() => { setActive(null); setSearch('') }, 150)}
              placeholder="Rechercher une ville…"
              className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          {filtered.length > 0 && (
            <div className="overflow-y-auto max-h-48">
              {filtered.map(v => (
                <button key={v.tz} type="button"
                  onMouseDown={() => selectVille(v)}
                  className="w-full flex items-center px-4 py-2.5 text-left hover:bg-gray-50 transition text-sm text-gray-800 border-b border-gray-50 last:border-0">
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <span className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ background: diffColor.bg, color: diffColor.text }}>
          {diffLabel} entre les deux
        </span>
      </div>
    </div>
  )
}
