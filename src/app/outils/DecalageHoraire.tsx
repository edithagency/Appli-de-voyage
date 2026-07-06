'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

const GlobeViz = dynamic(() => import('./GlobeViz'), { ssr: false })

type Ville = { label: string; tz: string; lat?: number; lon?: number }
type SearchResult = { label: string; country: string; lat: number; lon: number }

function loadVille(key: string, fallback: Ville): Ville {
  if (typeof window === 'undefined') return fallback
  const tz    = localStorage.getItem(key + '_tz')
  const label = localStorage.getItem(key + '_label')
  const lat   = localStorage.getItem(key + '_lat')
  const lon   = localStorage.getItem(key + '_lon')
  // Si lat/lon absents (ancien format), on repart des défauts pour avoir le globe
  if (!tz || !label || !lat || !lon) return fallback
  return { tz, label, lat: +lat, lon: +lon }
}

function saveVille(key: string, v: Ville) {
  localStorage.setItem(key + '_tz',    v.tz)
  localStorage.setItem(key + '_label', v.label)
  if (v.lat != null) localStorage.setItem(key + '_lat', String(v.lat))
  if (v.lon != null) localStorage.setItem(key + '_lon', String(v.lon))
}

async function searchCities(q: string): Promise<SearchResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1`
  const resp = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
  const data: any[] = await resp.json()
  const seen = new Set<string>()
  const results: SearchResult[] = []
  for (const r of data) {
    const name    = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.name
    const country = r.address?.country || ''
    if (!name) continue
    const k = name + '|' + country
    if (seen.has(k)) continue
    seen.add(k)
    results.push({ label: name, country, lat: parseFloat(r.lat), lon: parseFloat(r.lon) })
    if (results.length >= 6) break
  }
  return results
}

async function getTimezone(lat: number, lon: number): Promise<string> {
  const resp = await fetch(`https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`)
  const data = await resp.json()
  return data.timeZone
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

function useCityPicker(storageKey: string, fallback: Ville) {
  const [city,      setCity]      = useState<Ville>(() => loadVille(storageKey, fallback))
  const [search,    setSearch]    = useState(city.label)
  const [results,   setResults]   = useState<SearchResult[]>([])
  const [showList,  setShowList]  = useState(false)
  const [searching, setSearching] = useState(false)
  const [loadingTz, setLoadingTz] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function onFocus() { setSearch(''); setResults([]); setShowList(false) }

  function onChange(val: string) {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); setShowList(false); setSearching(false); return }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchCities(val)
        setResults(res); setShowList(res.length > 0)
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 350)
  }

  function onBlur() {
    setTimeout(() => { setShowList(false); setSearch(city.label); setResults([]) }, 150)
  }

  async function select(r: SearchResult) {
    setSearch(r.label); setShowList(false); setResults([])
    setLoadingTz(true)
    try {
      const tz = await getTimezone(r.lat, r.lon)
      const v: Ville = { label: r.label, tz, lat: r.lat, lon: r.lon }
      setCity(v); saveVille(storageKey, v)
    } catch { /* garde l'ancien fuseau */ }
    finally { setLoadingTz(false) }
  }

  return { city, search, results, showList, searching, loadingTz, onFocus, onChange, onBlur, select }
}

const DEFAULT_1: Ville = { label: 'Paris',   tz: 'Europe/Paris', lat: 48.8566, lon: 2.3522  }
const DEFAULT_2: Ville = { label: 'Bangkok', tz: 'Asia/Bangkok',  lat: 13.7563, lon: 100.502 }

export default function DecalageHoraire() {
  const [now, setNow] = useState(new Date())
  const p1 = useCityPicker('horaire_1', DEFAULT_1)
  const p2 = useCityPicker('horaire_2', DEFAULT_2)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = getOffset(now, p2.city.tz) - getOffset(now, p1.city.tz)
  const diffLabel = diff === 0 ? 'Même fuseau' : diff > 0 ? `+${diff}h` : `${diff}h`
  const diffColor = diff === 0
    ? { bg: '#F3F4F6', text: '#6B7280' }
    : { bg: '#e7f8ce', text: '#2D5A1B' }

  const globeCity1 = { label: p1.city.label, lat: p1.city.lat ?? DEFAULT_1.lat!, lon: p1.city.lon ?? DEFAULT_1.lon! }
  const globeCity2 = { label: p2.city.label, lat: p2.city.lat ?? DEFAULT_2.lat!, lon: p2.city.lon ?? DEFAULT_2.lon! }

  return (
    <div className="flex flex-col gap-4">
      {/* Sélecteurs */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0">Destination</p>
      <div className="grid grid-cols-2 gap-3 pt-1">
        {[p1, p2].map((p, idx) => (
          <div key={idx} className="relative">
            <div className="relative">
              <input
                type="text"
                value={p.search}
                onFocus={p.onFocus}
                onChange={e => p.onChange(e.target.value)}
                onBlur={p.onBlur}
                placeholder="Rechercher…"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
              />
              {p.searching && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">…</span>
              )}
            </div>
            {p.showList && p.results.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-y-auto z-20" style={{ maxHeight: '220px' }}>
                {p.results.map((r, i) => (
                  <button key={i} type="button"
                    onMouseDown={() => p.select(r)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0">
                    <span className="text-gray-800 font-medium">{r.label}</span>
                    <span className="text-gray-400 text-xs">{r.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Horloges */}
      <div className="grid grid-cols-2 gap-3">
        {[p1, p2].map((p, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-gray-500 mb-1">{p.city.label}</p>
            {p.loadingTz ? (
              <p className="text-sm text-gray-400 italic">Chargement…</p>
            ) : (
              <>
                <p className="text-2xl font-bold tabular-nums leading-none"
                  style={{ color: idx === 0 ? '#1a2e2f' : '#36A6B2' }}>
                  {formatHeure(now, p.city.tz)}
                </p>
                <p className="text-xs text-gray-400 capitalize leading-tight mt-1">
                  {formatJour(now, p.city.tz)}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Badge décalage */}
      <div className="flex justify-center">
        <span className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ background: diffColor.bg, color: diffColor.text }}>
          {diffLabel} entre les deux
        </span>
      </div>

      {/* Globe 3D */}
      <GlobeViz city1={globeCity1} city2={globeCity2} />
    </div>
  )
}
