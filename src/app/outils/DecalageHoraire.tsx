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

function loadVille(key: string, fallback: Ville): Ville {
  if (typeof window === 'undefined') return fallback
  const tz    = localStorage.getItem(key + '_tz')
  const label = localStorage.getItem(key + '_label')
  return tz && label ? { tz, label } : fallback
}

function saveVille(key: string, v: Ville) {
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
  const [now,   setNow]   = useState(new Date())
  const [city1, setCity1] = useState<Ville>(() => loadVille('horaire_1', { label: 'Paris',   tz: 'Europe/Paris'   }))
  const [city2, setCity2] = useState<Ville>(() => loadVille('horaire_2', { label: 'Bangkok', tz: 'Asia/Bangkok'   }))

  const [search1, setSearch1] = useState(city1.label)
  const [search2, setSearch2] = useState(city2.label)
  const [showList1, setShowList1] = useState(false)
  const [showList2, setShowList2] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  function select1(v: Ville) {
    setCity1(v); saveVille('horaire_1', v)
    setSearch1(v.label); setShowList1(false)
  }
  function select2(v: Ville) {
    setCity2(v); saveVille('horaire_2', v)
    setSearch2(v.label); setShowList2(false)
  }

  const filtered1 = showList1
    ? VILLES.filter(v => v.label.toLowerCase().includes(search1.toLowerCase())).slice(0, 6)
    : []
  const filtered2 = showList2
    ? VILLES.filter(v => v.label.toLowerCase().includes(search2.toLowerCase())).slice(0, 6)
    : []

  const diff = getOffset(now, city2.tz) - getOffset(now, city1.tz)
  const diffLabel = diff === 0 ? 'Même fuseau' : diff > 0 ? `+${diff}h` : `${diff}h`
  const diffColor = diff === 0
    ? { bg: '#F3F4F6', text: '#6B7280' }
    : { bg: '#e7f8ce', text: '#2D5A1B' }

  return (
    <div className="flex flex-col gap-4">
      {/* Sélecteurs côte à côte */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ville 1</p>
          <input
            type="text"
            value={search1}
            onChange={e => { setSearch1(e.target.value); setShowList1(e.target.value.length > 0) }}
            onBlur={() => setTimeout(() => { setShowList1(false); setSearch1(city1.label) }, 150)}
            placeholder="Rechercher…"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ville 2</p>
          <input
            type="text"
            value={search2}
            onChange={e => { setSearch2(e.target.value); setShowList2(e.target.value.length > 0) }}
            onBlur={() => setTimeout(() => { setShowList2(false); setSearch2(city2.label) }, 150)}
            placeholder="Rechercher…"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
          />
        </div>
      </div>

      {/* Dropdowns */}
      {showList1 && filtered1.length > 0 && (
        <div className="w-full -mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
          {filtered1.map(v => (
            <button key={v.tz} type="button"
              onMouseDown={() => select1(v)}
              className="w-full flex items-center px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0 text-gray-800">
              {v.label}
            </button>
          ))}
        </div>
      )}
      {showList2 && filtered2.length > 0 && (
        <div className="w-full -mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
          {filtered2.map(v => (
            <button key={v.tz} type="button"
              onMouseDown={() => select2(v)}
              className="w-full flex items-center px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0 text-gray-800">
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* Les deux horloges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-0.5">
          <p className="text-xs font-semibold text-gray-500 mb-1">{city1.label}</p>
          <p className="text-2xl font-bold tabular-nums leading-none" style={{ color: '#36A6B2' }}>
            {formatHeure(now, city1.tz)}
          </p>
          <p className="text-xs text-gray-400 capitalize leading-tight mt-1">{formatJour(now, city1.tz)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-0.5">
          <p className="text-xs font-semibold text-gray-500 mb-1">{city2.label}</p>
          <p className="text-2xl font-bold tabular-nums leading-none text-gray-800">
            {formatHeure(now, city2.tz)}
          </p>
          <p className="text-xs text-gray-400 capitalize leading-tight mt-1">{formatJour(now, city2.tz)}</p>
        </div>
      </div>

      {/* Badge décalage */}
      <div className="flex justify-center">
        <span className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ background: diffColor.bg, color: diffColor.text }}>
          {diffLabel} entre les deux
        </span>
      </div>
    </div>
  )
}
