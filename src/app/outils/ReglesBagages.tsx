'use client'

import { useState } from 'react'
import { reglesBagages, type Statut } from '@/lib/data/bagages'

const COMPAGNIES = [
  { id: 'air_france', nom: 'Air France' },
  { id: 'easyjet',   nom: 'EasyJet' },
  { id: 'ryanair',   nom: 'Ryanair' },
  { id: 'transavia', nom: 'Transavia' },
  { id: 'vueling',   nom: 'Vueling' },
  { id: 'emirates',  nom: 'Emirates' },
  { id: 'turkish',   nom: 'Turkish Airlines' },
  { id: 'qatar',     nom: 'Qatar Airways' },
  { id: 'lufthansa', nom: 'Lufthansa' },
  { id: 'klm',       nom: 'KLM' },
  { id: 'british',   nom: 'British Airways' },
  { id: 'iberia',    nom: 'Iberia' },
]

const TYPES_BILLET = [
  { id: 'basic',    label: 'Basic' },
  { id: 'standard', label: 'Standard' },
  { id: 'flex',     label: 'Flex / Premium' },
]

const BLOCS = [
  { id: 'sous_siege' as const, titre: 'Petit bagage', sousTitre: 'Sous le siège', icon: '🎒' },
  { id: 'cabine'     as const, titre: 'Bagage cabine', sousTitre: 'Dans le coffre', icon: '🧳' },
  { id: 'soute'      as const, titre: 'Valise en soute', sousTitre: 'En soute', icon: '📦' },
]

const statutStyle = {
  inclus:        { bg: '#F0FDF4', border: '#BBF7D0', badgeBg: '#DCFCE7', badgeColor: '#166534' },
  payant:        { bg: '#FFFBEB', border: '#FDE68A', badgeBg: '#FEF3C7', badgeColor: '#B45309' },
  non_autorise:  { bg: '#FEF2F2', border: '#FECACA', badgeBg: '#FEE2E2', badgeColor: '#991B1B' },
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 8px',
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  fontSize: 13,
  textAlign: 'center',
  background: 'white',
  outline: 'none',
  minWidth: 0,
}

export default function ReglesBagages() {
  const [compagnieId,   setCompagnieId]   = useState<string | null>(null)
  const [billetId,      setBilletId]      = useState<string | null>(null)
  const [search,        setSearch]        = useState('')
  const [showDropdown,  setShowDropdown]  = useState(false)
  const [L, setL] = useState('')
  const [H, setH] = useState('')
  const [P, setP] = useState('')
  const [kg, setKg] = useState('')

  const compagnie = COMPAGNIES.find(c => c.id === compagnieId) ?? null
  const regles    = compagnieId ? reglesBagages[compagnieId] : null

  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const filtered = COMPAGNIES.filter(c => norm(c.nom).startsWith(norm(search))).slice(0, 6)

  function selectCompagnie(id: string, nom: string) {
    setCompagnieId(id)
    setSearch(nom)
    setShowDropdown(false)
    setBilletId(null)
    setL(''); setH(''); setP(''); setKg('')
    if (reglesBagages[id]?.pas_de_distinction) {
      setTimeout(() => setBilletId('basic'), 50)
    }
  }

  const billet = billetId && regles ? regles.billets[billetId as 'basic' | 'standard' | 'flex'] : null

  // Vérificateur de bagage cabine
  const dims = billet ? billet.cabine.dimensions : null
  const dimsMatch = dims?.match(/(\d+)×(\d+)×(\d+)/)
  const lMax = dimsMatch ? parseInt(dimsMatch[1]) : null
  const hMax = dimsMatch ? parseInt(dimsMatch[2]) : null
  const pMax = dimsMatch ? parseInt(dimsMatch[3]) : null
  const poidsMatch = billet?.cabine.poids.match(/(\d+)/)
  const kgMax = poidsMatch ? parseInt(poidsMatch[1]) : null

  const lv = parseFloat(L), hv = parseFloat(H), pv = parseFloat(P), kgv = parseFloat(kg)
  const hasVerif = L && H && P
  const rentreEnCabine = hasVerif && lMax && hMax && pMax
    ? lv <= lMax && hv <= hMax && pv <= pMax && (kg ? (kgMax ? kgv <= kgMax : true) : true)
    : null

  return (
    <div className="flex flex-col gap-5" style={{ minHeight: 220 }}>

      {/* ÉTAPE 1 */}
      <div className="relative">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Quelle est ta compagnie ?
        </p>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowDropdown(true); setCompagnieId(null); setBilletId(null) }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Rechercher une compagnie..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
        />
        {showDropdown && search.length > 0 && filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            {filtered.map(c => (
              <button key={c.id} type="button" onMouseDown={() => selectCompagnie(c.id, c.nom)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm">
                <span className="text-gray-800">{c.nom}</span>
                {compagnieId === c.id && <span className="ml-auto text-[#36A6B2]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ÉTAPE 2 — type de billet */}
      {compagnie && !regles?.pas_de_distinction && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px' }}>
            Quel type de billet as-tu ?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {TYPES_BILLET.map(t => {
              const isSelected = billetId === t.id
              return (
                <button key={t.id} onClick={() => setBilletId(t.id)} style={{
                  flex: 1,
                  padding: '10px 6px',
                  borderRadius: 9999,
                  border: 'none',
                  background: isSelected ? '#36A6B2' : '#F3F4F6',
                  color: isSelected ? 'white' : '#6B7280',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}>
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ÉTAPE 3 — résultats */}
      {billet && regles && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>

          {/* 3 blocs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {BLOCS.map(bloc => {
              const data = billet[bloc.id]
              const s = statutStyle[data.statut]
              return (
                <div key={bloc.id} style={{
                  flex: 1,
                  borderRadius: 16,
                  padding: 12,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: 24 }}>{bloc.icon}</span>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', margin: '8px 0 2px' }}>
                    {bloc.titre}
                  </p>
                  <p style={{ fontSize: 10, color: '#9CA3AF', margin: '0 0 8px' }}>
                    {bloc.sousTitre}
                  </p>
                  <p style={{ fontSize: 11, color: '#374151', fontWeight: 600, margin: '0 0 2px' }}>
                    {data.dimensions}
                  </p>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 8px' }}>
                    {data.poids}
                  </p>
                  <div style={{
                    padding: '3px 8px',
                    borderRadius: 9999,
                    background: s.badgeBg,
                    fontSize: 10,
                    fontWeight: 700,
                    color: s.badgeColor,
                    display: 'inline-block',
                  }}>
                    {data.statut === 'inclus'
                      ? '✅ Inclus'
                      : data.statut === 'payant'
                        ? `➕ À partir de ${data.prix}€`
                        : '❌ Non autorisé'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Vérificateur */}
          <div style={{ background: '#F8F9FA', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: '#1a1a1a' }}>
              🔍 Mon bagage rentre-t-il ?
            </p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input placeholder="L (cm)" type="number" style={inputStyle} value={L} onChange={e => setL(e.target.value)} />
              <input placeholder="H (cm)" type="number" style={inputStyle} value={H} onChange={e => setH(e.target.value)} />
              <input placeholder="P (cm)" type="number" style={inputStyle} value={P} onChange={e => setP(e.target.value)} />
              <input placeholder="kg"     type="number" style={inputStyle} value={kg} onChange={e => setKg(e.target.value)} />
            </div>
            {hasVerif && rentreEnCabine !== null && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: rentreEnCabine ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${rentreEnCabine ? '#BBF7D0' : '#FECACA'}`,
                fontSize: 13,
                fontWeight: 600,
                color: rentreEnCabine ? '#166534' : '#991B1B',
              }}>
                {rentreEnCabine
                  ? '✅ Ton bagage rentre en cabine'
                  : '❌ Trop grand — il faudra le mettre en soute'}
              </div>
            )}
          </div>

          {/* Note de fiabilité */}
          <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginBottom: 4, fontStyle: 'italic' }}>
            Informations vérifiées le {regles.date_maj}. Toujours confirmer sur le site de la compagnie avant de voyager.
          </p>
          <a href={regles.lien_officiel} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', textAlign: 'center', fontSize: 12, color: '#36A6B2', fontWeight: 600 }}>
            Voir les règles officielles →
          </a>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
