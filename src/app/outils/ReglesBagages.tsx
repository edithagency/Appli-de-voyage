'use client'

import { useState } from 'react'
import { COMPAGNIES } from '@/lib/utils/compagnies'

export default function ReglesBagages() {
  const [compagnieId, setCompagnieId] = useState<string | null>(null)
  const [showSelect, setShowSelect] = useState(true)
  const [search, setSearch] = useState('')

  const compagnie = COMPAGNIES.find(c => c.id === compagnieId) ?? null

  function handleSelect(id: string) {
    setCompagnieId(id)
    setShowSelect(false)
    setSearch('')
  }

  const filtered = COMPAGNIES.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-bold text-gray-800 text-lg">🧳 Règles bagages</h2>

      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-400">Dimensions et poids par compagnie aérienne</p>
        <button
          onClick={() => setShowSelect(!showSelect)}
          className="shrink-0 text-xs px-3 py-2 rounded-xl font-semibold transition"
          style={{ background: '#DBEAFE', color: '#36A6B2' }}>
          {compagnie ? '✏️ Changer' : '+ Choisir'}
        </button>
      </div>

      {showSelect && (
        <div className="rounded-xl bg-gray-50 px-3 py-3">
          <input
            type="text"
            placeholder="Rechercher une compagnie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] mb-3"
            autoFocus
          />
          <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {filtered.map(c => (
                <button key={c.id} onClick={() => handleSelect(c.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: compagnieId === c.id ? c.couleur : `${c.couleur}22`,
                    color: compagnieId === c.id ? '#ffffff' : c.couleur,
                  }}>
                  {c.nom}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {compagnie ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: compagnie.couleur, color: '#ffffff' }}>
              {compagnie.nom}
            </span>
            <div>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: compagnie.type === 'low_cost' ? '#FEF3C7' : compagnie.type === 'long_courrier' ? '#DBEAFE' : '#F3F4F6', color: compagnie.type === 'low_cost' ? '#92400E' : compagnie.type === 'long_courrier' ? '#36A6B2' : '#6B7280' }}>
                {compagnie.type === 'low_cost' ? 'Low cost' : compagnie.type === 'long_courrier' ? 'Long-courrier' : 'Classique'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <BagCard
              emoji="👜"
              label="Bagage personnel"
              dims={compagnie.bagages.bagage_personnel.dimensions}
              inclus={compagnie.bagages.bagage_personnel.inclus}
            />
            <BagCard
              emoji="🎒"
              label="Bagage cabine"
              dims={compagnie.bagages.cabine.dimensions}
              poids={compagnie.bagages.cabine.poids}
              inclus={compagnie.bagages.cabine.inclus}
              prix={!compagnie.bagages.cabine.inclus ? 'Payant' : undefined}
            />
            <BagCard
              emoji="🧳"
              label="Bagage soute"
              poids={compagnie.bagages.soute.poids}
              inclus={compagnie.bagages.soute.inclus}
              prix={!compagnie.bagages.soute.inclus ? compagnie.bagages.soute.prix_aprox : undefined}
            />
          </div>

          {compagnie.bagages.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
              <p className="text-xs text-amber-800 leading-relaxed">💡 {compagnie.bagages.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-4 text-center">
          <div className="text-3xl mb-2">✈️</div>
          <p className="text-xs text-gray-400">Sélectionne ta compagnie aérienne pour voir les règles bagages.</p>
        </div>
      )}
    </div>
  )
}

function BagCard({ emoji, label, dims, poids, inclus, prix }: {
  emoji: string; label: string; dims?: string; poids?: string; inclus: boolean; prix?: string
}) {
  return (
    <div className="rounded-2xl p-3 text-center flex flex-col items-center gap-1"
      style={{ background: inclus ? '#D1FAE5' : '#FEE2E2' }}>
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs font-semibold leading-tight text-gray-700">{label}</span>
      {poids && <span className="text-xs font-bold text-gray-900">{poids}</span>}
      {dims && <span className="text-xs text-gray-500 leading-tight">{dims}</span>}
      <span className="text-xs font-bold mt-0.5" style={{ color: inclus ? '#065F46' : '#991B1B' }}>
        {inclus ? '✓ Inclus' : prix ?? 'Payant'}
      </span>
    </div>
  )
}
