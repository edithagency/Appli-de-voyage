'use client'

import { useState, useId } from 'react'
import { reglesBagages } from '@/lib/data/bagages'
import { Backpack, Luggage, Package, type LucideIcon } from 'lucide-react'

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

function TicketButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  const uid = useId().replace(/:/g, '')
  const mainBg = selected ? '#36A6B2' : 'white'
  const stubBg = selected ? '#2b8f9c' : 'white'
  const color  = selected ? 'white'   : '#374151'
  const dash   = selected ? 'rgba(255,255,255,0.35)' : '#C8C8C8'
  // Forme billet : coins arrondis 3px + encoches semi-circulaires r=10 au centre vertical
  const ticketPath = 'M3,0 H97 C98.5,0 100,1.5 100,3 V10 A10,10,0,0,0,100,30 V37 C100,38.5 98.5,40 97,40 H3 C1.5,40 0,38.5 0,37 V30 A10,10,0,0,1,0,10 V3 C0,1.5 1.5,0 3,0 Z'
  return (
    <button onClick={onClick}
      style={{ flex: 1, position: 'relative', border: 'none', background: 'none', padding: 0, cursor: 'pointer', height: 40 }}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <clipPath id={uid}><path d={ticketPath} /></clipPath>
        </defs>
        {/* Stub gauche */}
        <rect x="0" y="0" width="22" height="40" fill={stubBg} clipPath={`url(#${uid})`} />
        {/* Corps principal */}
        <rect x="22" y="0" width="78" height="40" fill={mainBg} clipPath={`url(#${uid})`} />
        {/* Bordure pour état non sélectionné */}
        {!selected && <path d={ticketPath} fill="none" stroke="#C0C0C0" strokeWidth="1" strokeDasharray="4,3" />}
        {/* Ligne de perforation verticale */}
        <line x1="22" y1="4" x2="22" y2="36" stroke={dash} strokeWidth="1" strokeDasharray="3,2" />
      </svg>
      <div style={{
        position: 'relative', zIndex: 1,
        height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: '-0.01em' }}>
          {label}
        </span>
      </div>
    </button>
  )
}

const BLOCS: { id: 'sous_siege' | 'cabine' | 'soute'; titre: string; Icon: LucideIcon }[] = [
  { id: 'sous_siege', titre: 'Petit bagage',    Icon: Backpack },
  { id: 'cabine',     titre: 'Bagage cabine',   Icon: Luggage  },
  { id: 'soute',      titre: 'Valise en soute', Icon: Package  },
]

const statutStyle = {
  inclus:       { bg: '#F0FDF4', border: '#BBF7D0', badgeBg: '#DCFCE7', badgeColor: '#166534' },
  payant:       { bg: '#FFFBEB', border: '#FDE68A', badgeBg: '#FEF3C7', badgeColor: '#B45309' },
  non_autorise: { bg: '#FEF2F2', border: '#FECACA', badgeBg: '#FEE2E2', badgeColor: '#991B1B' },
}

const pillStyle = (selected: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '10px 6px',
  borderRadius: 9999,
  border: 'none',
  background: selected ? '#36A6B2' : '#F3F4F6',
  color: selected ? 'white' : '#6B7280',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
})

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
  const [compagnieId,  setCompagnieId]  = useState<string | null>(null)
  const [classeIdx,    setClasseIdx]    = useState<number | null>(null)
  const [billetIdx,    setBilletIdx]    = useState<number | null>(null)
  const [search,       setSearch]       = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [L, setL] = useState('')
  const [H, setH] = useState('')
  const [P, setP] = useState('')
  const [kg, setKg] = useState('')

  const compagnie = COMPAGNIES.find(c => c.id === compagnieId) ?? null
  const regles    = compagnieId ? reglesBagages[compagnieId] : null
  const classe    = regles && classeIdx !== null ? regles.classes[classeIdx] : null
  const billet    = classe && billetIdx !== null ? classe.billets[billetIdx] : null

  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const filtered = COMPAGNIES.filter(c => norm(c.nom).startsWith(norm(search))).slice(0, 6)

  function selectCompagnie(id: string, nom: string) {
    setCompagnieId(id)
    setSearch(nom)
    setShowDropdown(false)
    setL(''); setH(''); setP(''); setKg('')

    const r = reglesBagages[id]
    if (!r) { setClasseIdx(null); setBilletIdx(null); return }

    if (r.classes.length === 1) {
      setClasseIdx(0)
      if (r.classes[0].billets.length === 1) {
        setBilletIdx(0)
      } else {
        setBilletIdx(null)
      }
    } else {
      setClasseIdx(null)
      setBilletIdx(null)
    }
  }

  // Vérificateur de bagage cabine
  const dims = billet?.cabine.dimensions ?? null
  const dimsMatch = dims?.match(/(\d+)×(\d+)×(\d+)/)
  const lMax = dimsMatch ? parseInt(dimsMatch[1]) : null
  const hMax = dimsMatch ? parseInt(dimsMatch[2]) : null
  const pMax = dimsMatch ? parseInt(dimsMatch[3]) : null
  const poidsMatch = billet?.cabine.poids.match(/(\d+)/)
  const kgMax = poidsMatch ? parseInt(poidsMatch[1]) : null

  const hasVerif = L && H && P
  const lv = parseFloat(L), hv = parseFloat(H), pv = parseFloat(P), kgv = parseFloat(kg)
  const rentreEnCabine = hasVerif && lMax && hMax && pMax
    ? lv <= lMax && hv <= hMax && pv <= pMax && (kg ? (kgMax ? kgv <= kgMax : true) : true)
    : null

  return (
    <div className="flex flex-col gap-5" style={{ minHeight: 220 }}>

      {/* ÉTAPE 1 — compagnie */}
      <div className="relative">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Quelle est ta compagnie ?
        </p>
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setShowDropdown(true)
            setCompagnieId(null)
            setClasseIdx(null)
            setBilletIdx(null)
          }}
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

      {/* ÉTAPE 2 — classe (seulement si plusieurs classes) */}
      {compagnie && regles && regles.classes.length > 1 && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Quelle est ta classe ?
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {regles.classes.map((c, i) => (
              <TicketButton key={i} label={c.label} selected={classeIdx === i}
                onClick={() => { setClasseIdx(i); setBilletIdx(null) }} />
            ))}
          </div>
        </div>
      )}

      {/* ÉTAPE 3 — type de billet (si plusieurs billets dans la classe) */}
      {classe && classe.billets.length > 1 && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Quel type de billet as-tu ?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {classe.billets.map((b, i) => (
              <button key={i} style={pillStyle(billetIdx === i)} onClick={() => setBilletIdx(i)}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ÉTAPE 4 — résultats */}
      {billet && regles && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {BLOCS.map(bloc => {
              const data = billet[bloc.id]
              const s = statutStyle[data.statut]
              const qtLabel = data.quantite && data.quantite > 1 ? `${data.quantite} × ` : ''
              const badgeLabel = data.statut === 'inclus'
                ? (data.quantite && data.quantite > 1 ? `Inclus (×${data.quantite})` : 'Inclus')
                : data.statut === 'payant'
                  ? (data.prix !== null ? `+ ${data.prix} €` : 'Payant')
                  : 'Non autorisé'

              return (
                <div key={bloc.id} style={{
                  borderRadius: 16,
                  padding: '12px 16px',
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <bloc.Icon size={22} color="#6B7280" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 1px' }}>
                      {bloc.titre}
                    </p>
                    {data.statut !== 'non_autorise' && (
                      <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>
                        {qtLabel}{data.dimensions} · {data.poids}
                      </p>
                    )}
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: s.badgeBg,
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.badgeColor,
                    flexShrink: 0,
                  }}>
                    {badgeLabel}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Vérificateur */}
          {billet.cabine.statut !== 'non_autorise' && (
            <div style={{ background: '#F8F9FA', borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Mon bagage rentre-t-il ?
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
                    ? 'Ton bagage rentre en cabine'
                    : 'Trop grand, il faudra le mettre en soute'}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => window.open(regles.lien_officiel, '_blank', 'noopener,noreferrer')}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 bg-[#f2e6de] rounded-xl px-3 py-2">
            <span>Voir les règles officielles</span>
            <span className="opacity-60">↗</span>
          </button>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
