'use client'

import { useEffect, useState } from 'react'

const VILLES = [
  { label: 'Paris', tz: 'Europe/Paris' },
  { label: 'Londres', tz: 'Europe/London' },
  { label: 'Lisbonne', tz: 'Europe/Lisbon' },
  { label: 'Madrid', tz: 'Europe/Madrid' },
  { label: 'Marrakech', tz: 'Africa/Casablanca' },
  { label: 'Tunis', tz: 'Africa/Tunis' },
  { label: 'Le Caire', tz: 'Africa/Cairo' },
  { label: 'Dakar', tz: 'Africa/Dakar' },
  { label: 'Nairobi', tz: 'Africa/Nairobi' },
  { label: 'Johannesburg', tz: 'Africa/Johannesburg' },
  { label: 'Moscou', tz: 'Europe/Moscow' },
  { label: 'Istanbul', tz: 'Europe/Istanbul' },
  { label: 'Dubaï', tz: 'Asia/Dubai' },
  { label: 'Mumbai', tz: 'Asia/Kolkata' },
  { label: 'Bangkok', tz: 'Asia/Bangkok' },
  { label: 'Bali', tz: 'Asia/Makassar' },
  { label: 'Singapour', tz: 'Asia/Singapore' },
  { label: 'Hong Kong', tz: 'Asia/Hong_Kong' },
  { label: 'Pékin', tz: 'Asia/Shanghai' },
  { label: 'Tokyo', tz: 'Asia/Tokyo' },
  { label: 'Séoul', tz: 'Asia/Seoul' },
  { label: 'Sydney', tz: 'Australia/Sydney' },
  { label: 'Auckland', tz: 'Pacific/Auckland' },
  { label: 'New York', tz: 'America/New_York' },
  { label: 'Montréal', tz: 'America/Toronto' },
  { label: 'Chicago', tz: 'America/Chicago' },
  { label: 'Los Angeles', tz: 'America/Los_Angeles' },
  { label: 'Mexico', tz: 'America/Mexico_City' },
  { label: 'São Paulo', tz: 'America/Sao_Paulo' },
  { label: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires' },
]

function formatHeure(date: Date, tz: string) {
  return date.toLocaleTimeString('fr-FR', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatJour(date: Date, tz: string) {
  return date.toLocaleDateString('fr-FR', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function getOffset(date: Date, tz: string): number {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' })
  const tzStr = date.toLocaleString('en-US', { timeZone: tz })
  return (new Date(tzStr).getTime() - new Date(utcStr).getTime()) / (1000 * 60 * 60)
}

export default function DecalageHoraire() {
  const [now, setNow] = useState(new Date())
  const [ici, setIci] = useState('Europe/Paris')
  const [laBas, setLaBas] = useState('Asia/Bangkok')

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const offsetIci = getOffset(now, ici)
  const offsetLaBas = getOffset(now, laBas)
  const diff = offsetLaBas - offsetIci
  const diffLabel = diff === 0 ? 'Même fuseau' : diff > 0 ? `+${diff}h` : `${diff}h`

  return (
    <div className="flex flex-col gap-4">
      {/* Deux horloges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-1">
          <p className="text-xs text-gray-400 font-medium">Ici</p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: '#36A6B2' }}>
            {formatHeure(now, ici)}
          </p>
          <p className="text-xs text-gray-500 capitalize leading-tight">{formatJour(now, ici)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-1">
          <p className="text-xs text-gray-400 font-medium">Là-bas</p>
          <p className="text-2xl font-bold tabular-nums text-gray-800">
            {formatHeure(now, laBas)}
          </p>
          <p className="text-xs text-gray-500 capitalize leading-tight">{formatJour(now, laBas)}</p>
        </div>
      </div>

      {/* Badge décalage */}
      <div className="flex justify-center">
        <span className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ background: diff === 0 ? '#F3F4F6' : '#DBEAFE', color: diff === 0 ? '#6B7280' : '#92400E' }}>
          {diffLabel} par rapport à chez toi
        </span>
      </div>

      {/* Sélecteurs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12 shrink-0">Ici</span>
          <select value={ici} onChange={e => setIci(e.target.value)}
            className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none">
            {VILLES.map(v => <option key={v.tz} value={v.tz}>{v.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12 shrink-0">Là-bas</span>
          <select value={laBas} onChange={e => setLaBas(e.target.value)}
            className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none">
            {VILLES.map(v => <option key={v.tz} value={v.tz}>{v.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
