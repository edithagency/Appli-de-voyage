'use client'

import { useRef, useState } from 'react'

export type LieuResult = { label: string; country: string; lat: number; lon: number }

async function searchLieux(q: string): Promise<LieuResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1`
  const resp = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
  const data: any[] = await resp.json()
  const seen = new Set<string>()
  const results: LieuResult[] = []
  for (const r of data) {
    const name = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.name
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

// Recherche libre de ville (comme l'outil décalage horaire) — pas de liste figée,
// n'importe quelle ville peut être renseignée via l'autocomplétion Nominatim.
export default function CityAutocomplete({
  value, onChange, onSelect, onBlur, placeholder, className,
}: {
  value: string
  onChange: (v: string) => void
  onSelect: (r: LieuResult) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
}) {
  const [results, setResults] = useState<LieuResult[]>([])
  const [showList, setShowList] = useState(false)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(val: string) {
    onChange(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); setShowList(false); setSearching(false); return }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchLieux(val)
        setResults(res); setShowList(res.length > 0)
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 350)
  }

  function handleBlur() {
    setTimeout(() => setShowList(false), 150)
    onBlur?.()
  }

  function handleSelect(r: LieuResult) {
    setShowList(false); setResults([])
    onSelect(r)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setShowList(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
      />
      {searching && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">…</span>
      )}
      {showList && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-y-auto z-20" style={{ maxHeight: 220 }}>
          {results.map((r, i) => (
            <button key={i} type="button"
              onMouseDown={() => handleSelect(r)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0">
              <span className="text-gray-800 font-medium">{r.label}</span>
              <span className="text-gray-400 text-xs">{r.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
