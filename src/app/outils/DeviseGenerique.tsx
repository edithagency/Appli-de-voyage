'use client'

import { useEffect, useState, useRef } from 'react'

const DEVISES = [
  { code: 'EUR', label: 'Euro', symbole: '€', flag: '🇪🇺' },
  { code: 'USD', label: 'Dollar américain', symbole: '$', flag: '🇺🇸' },
  { code: 'GBP', label: 'Livre sterling', symbole: '£', flag: '🇬🇧' },
  { code: 'CHF', label: 'Franc suisse', symbole: 'CHF', flag: '🇨🇭' },
  { code: 'CAD', label: 'Dollar canadien', symbole: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', label: 'Dollar australien', symbole: 'AU$', flag: '🇦🇺' },
  { code: 'JPY', label: 'Yen japonais', symbole: '¥', flag: '🇯🇵' },
  { code: 'THB', label: 'Baht thaïlandais', symbole: '฿', flag: '🇹🇭' },
  { code: 'AED', label: 'Dirham des Émirats', symbole: 'AED', flag: '🇦🇪' },
  { code: 'MAD', label: 'Dirham marocain', symbole: 'MAD', flag: '🇲🇦' },
  { code: 'SGD', label: 'Dollar singapourien', symbole: 'S$', flag: '🇸🇬' },
  { code: 'MXN', label: 'Peso mexicain', symbole: 'MX$', flag: '🇲🇽' },
  { code: 'TRY', label: 'Livre turque', symbole: '₺', flag: '🇹🇷' },
  { code: 'INR', label: 'Roupie indienne', symbole: '₹', flag: '🇮🇳' },
  { code: 'IDR', label: 'Roupiah indonésienne', symbole: 'Rp', flag: '🇮🇩' },
  { code: 'KRW', label: 'Won coréen', symbole: '₩', flag: '🇰🇷' },
  { code: 'MYR', label: 'Ringgit malaisien', symbole: 'RM', flag: '🇲🇾' },
  { code: 'ZAR', label: 'Rand sud-africain', symbole: 'R', flag: '🇿🇦' },
  { code: 'BRL', label: 'Réal brésilien', symbole: 'R$', flag: '🇧🇷' },
  { code: 'TND', label: 'Dinar tunisien', symbole: 'DT', flag: '🇹🇳' },
  { code: 'EGP', label: 'Livre égyptienne', symbole: 'E£', flag: '🇪🇬' },
  { code: 'VND', label: 'Dong vietnamien', symbole: '₫', flag: '🇻🇳' },
  { code: 'CZK', label: 'Couronne tchèque', symbole: 'Kč', flag: '🇨🇿' },
  { code: 'PLN', label: 'Zloty polonais', symbole: 'zł', flag: '🇵🇱' },
  { code: 'HUF', label: 'Forint hongrois', symbole: 'Ft', flag: '🇭🇺' },
  { code: 'SEK', label: 'Couronne suédoise', symbole: 'kr', flag: '🇸🇪' },
  { code: 'NOK', label: 'Couronne norvégienne', symbole: 'kr', flag: '🇳🇴' },
  { code: 'NZD', label: 'Dollar néo-zélandais', symbole: 'NZ$', flag: '🇳🇿' },
]

function toEur(amount: number, code: string, rates: Record<string, number>) {
  return code === 'EUR' ? amount : amount / (rates[code.toLowerCase()] ?? 1)
}
function fromEur(eur: number, code: string, rates: Record<string, number>) {
  return code === 'EUR' ? eur : eur * (rates[code.toLowerCase()] ?? 1)
}
function fmt(n: number) {
  if (isNaN(n) || !isFinite(n)) return ''
  return n >= 1000 ? n.toFixed(0) : n >= 1 ? n.toFixed(2) : n.toFixed(4)
}

type Side = 'from' | 'to' | null

export default function DeviseGenerique() {
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('USD')
  const [valFrom, setValFrom] = useState('1')
  const [valTo, setValTo] = useState('')
  const [picker, setPicker] = useState<Side>(null)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json')
      .then(r => r.json())
      .then(data => {
        const r = data.eur ?? {}
        setRates(r)
        setLoading(false)
        setValTo(fmt(fromEur(1, 'USD', r)))
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (picker) setTimeout(() => searchRef.current?.focus(), 50)
    else setSearch('')
  }, [picker])

  function handleFrom(v: string) {
    setValFrom(v)
    const n = parseFloat(v)
    setValTo(isNaN(n) ? '' : fmt(fromEur(toEur(n, from, rates), to, rates)))
  }

  function handleTo(v: string) {
    setValTo(v)
    const n = parseFloat(v)
    setValFrom(isNaN(n) ? '' : fmt(fromEur(toEur(n, to, rates), from, rates)))
  }

  function selectCurrency(code: string) {
    if (picker === 'from') {
      setFrom(code)
      const n = parseFloat(valFrom)
      setValTo(isNaN(n) ? '' : fmt(fromEur(toEur(n, code, rates), to, rates)))
    } else {
      setTo(code)
      const n = parseFloat(valFrom)
      setValTo(isNaN(n) ? '' : fmt(fromEur(toEur(n, from, rates), code, rates)))
    }
    setPicker(null)
  }

  function swap() {
    setFrom(to)
    setTo(from)
    setValFrom(valTo)
    setValTo(valFrom)
  }

  const fromInfo = DEVISES.find(d => d.code === from)!
  const toInfo = DEVISES.find(d => d.code === to)!

  const filtered = DEVISES.filter(d => {
    const q = search.toLowerCase()
    return d.code.toLowerCase().includes(q) || d.label.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-3">
      {loading && <p className="text-xs text-gray-400 text-center">Chargement des taux…</p>}

      {/* Ligne FROM */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPicker(picker === 'from' ? null : 'from')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold shrink-0 transition"
          style={{
            background: picker === 'from' ? '#36A6B2' : 'white',
            color: picker === 'from' ? 'white' : '#36A6B2',
            borderColor: picker === 'from' ? '#36A6B2' : '#e5e7eb',
          }}
        >
          <span>{fromInfo.flag}</span>
          <span>{fromInfo.code}</span>
          <span className="text-xs opacity-60">{picker === 'from' ? '▲' : '▼'}</span>
        </button>
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
          <input
            type="number"
            inputMode="decimal"
            value={valFrom}
            onChange={e => handleFrom(e.target.value)}
            className="w-full bg-transparent text-lg font-bold text-gray-800 focus:outline-none"
            placeholder="0"
          />
          <span className="text-sm text-gray-400 shrink-0">{fromInfo.symbole}</span>
        </div>
      </div>

      {/* Bouton swap */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <button onClick={swap}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 active:scale-95 transition-transform text-base">
          ⇅
        </button>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Ligne TO */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPicker(picker === 'to' ? null : 'to')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold shrink-0 transition"
          style={{
            background: picker === 'to' ? '#36A6B2' : 'white',
            color: picker === 'to' ? 'white' : '#36A6B2',
            borderColor: picker === 'to' ? '#36A6B2' : '#e5e7eb',
          }}
        >
          <span>{toInfo.flag}</span>
          <span>{toInfo.code}</span>
          <span className="text-xs opacity-60">{picker === 'to' ? '▲' : '▼'}</span>
        </button>
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
          <input
            type="number"
            inputMode="decimal"
            value={valTo}
            onChange={e => handleTo(e.target.value)}
            className="w-full bg-transparent text-lg font-bold focus:outline-none"
            style={{ color: '#36A6B2' }}
            placeholder="0"
          />
          <span className="text-sm text-gray-400 shrink-0">{toInfo.symbole}</span>
        </div>
      </div>

      {/* Picker inline */}
      {picker && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-3 pt-3 pb-2">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une devise…"
              className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.map(d => (
              <button
                key={d.code}
                onClick={() => selectCurrency(d.code)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition"
              >
                <span className="text-lg">{d.flag}</span>
                <span className="font-bold text-sm text-gray-800">{d.code}</span>
                <span className="text-xs text-gray-400 flex-1">{d.label}</span>
                <span className="text-xs font-semibold text-gray-500">{d.symbole}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        {loading ? '' : Object.keys(rates).length > 0
          ? '🔄 Taux BCE mis à jour quotidiennement'
          : '⚠️ Taux indisponibles — vérifiez votre connexion'}
      </p>
    </div>
  )
}
