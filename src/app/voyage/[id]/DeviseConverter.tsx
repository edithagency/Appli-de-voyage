'use client'

import { useState } from 'react'

export default function DeviseConverter({
  devise, symbole, tauxLive, tauxApprox,
}: {
  devise: string | null
  symbole: string | null
  tauxLive: number | null
  tauxApprox: number | null
}) {
  // 1 EUR = taux unités de devise locale
  const taux = tauxLive ?? (tauxApprox ? 1 / tauxApprox : null)
  const fmt = (n: number) => n >= 100 ? n.toFixed(0) : n.toFixed(2)

  const [eur, setEur] = useState('1')
  const [local, setLocal] = useState(taux ? fmt(taux) : '')

  function handleEurChange(v: string) {
    setEur(v)
    const n = parseFloat(v)
    setLocal(taux && !isNaN(n) ? fmt(n * taux) : '')
  }

  function handleLocalChange(v: string) {
    setLocal(v)
    const n = parseFloat(v)
    setEur(taux && !isNaN(n) ? (n / taux).toFixed(2) : '')
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm font-semibold text-gray-800">{devise ?? '–'}</p>

      {taux && taux !== 1 ? (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2.5">
              <input
                type="number"
                inputMode="decimal"
                value={eur}
                onChange={e => handleEurChange(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
              />
              <span className="text-xs text-gray-400 shrink-0">EUR</span>
            </div>
            <span className="text-gray-400">=</span>
            <div className="flex-1 flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2.5">
              <input
                type="number"
                inputMode="decimal"
                value={local}
                onChange={e => handleLocalChange(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
              />
              <span className="text-xs text-gray-400 shrink-0">{symbole ?? ''}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {tauxLive ? '🔄 Taux de change en temps réel' : 'Taux de change approximatif'}
          </p>
        </>
      ) : (
        <p className="text-xs text-gray-500">Même devise — pas de change</p>
      )}
    </div>
  )
}
