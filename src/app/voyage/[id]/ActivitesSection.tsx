'use client'

import { useEffect, useMemo, useState } from 'react'
import { toggleWishlistActivite } from './activites-actions'

type Activite = {
  id: string
  ville: string
  categorie: string
  titre: string
  horaires: string | null
  tarifs: string | null
  description: string | null
  notes: string | null
  photo_url: string | null
  ordre: number
}

const CATEGORIES: Record<string, { emoji: string; label: string; gradient: string }> = {
  temple_culture:  { emoji: '🛕', label: 'Temples & culture',   gradient: 'linear-gradient(135deg, #FDE047, #CA8A04)' },
  plage:           { emoji: '🏖️', label: 'Plages',              gradient: 'linear-gradient(135deg, #38BDF8, #0284C7)' },
  excursion_mer:   { emoji: '⛵', label: 'Excursions en mer',    gradient: 'linear-gradient(135deg, #2DD4BF, #0891B2)' },
  nature_aventure: { emoji: '🌳', label: 'Nature & aventure',    gradient: 'linear-gradient(135deg, #4ADE80, #15803D)' },
  marche_shopping: { emoji: '🛍️', label: 'Marchés & shopping',   gradient: 'linear-gradient(135deg, #FB923C, #C2410C)' },
  experience:      { emoji: '🎉', label: 'Expériences',          gradient: 'linear-gradient(135deg, #F472B6, #BE185D)' },
  sport:           { emoji: '🤿', label: 'Sport',                gradient: 'linear-gradient(135deg, #F87171, #DC2626)' },
  quartier:        { emoji: '🏙️', label: 'Quartiers',            gradient: 'linear-gradient(135deg, #94A3B8, #475569)' },
}

function HeartIcon({ filled, size = 18 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#EF4444' : 'none'} stroke={filled ? '#EF4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function NoteLines({ notes }: { notes: string }) {
  const lines = notes.split('\n').map(l => l.trim()).filter(Boolean)
  const urlRegex = /(https?:\/\/\S+)/

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {lines.map((line, i) => {
        let style = 'bg-gray-50 text-gray-600'
        if (line.startsWith('💡')) style = 'bg-indigo-50 text-indigo-700'
        else if (line.startsWith('⚠️')) style = 'bg-amber-50 text-amber-700'
        else if (line.startsWith('🔗')) style = 'bg-blue-50 text-blue-700'

        const match = line.match(urlRegex)
        return (
          <div key={i} className={`text-xs rounded-lg px-2.5 py-2 leading-relaxed ${style}`}>
            {match ? (
              <>
                {line.slice(0, match.index)}
                <a href={match[1]} target="_blank" rel="noopener noreferrer" className="underline font-medium">{match[1]}</a>
                {line.slice((match.index ?? 0) + match[1].length)}
              </>
            ) : line}
          </div>
        )
      })}
    </div>
  )
}

export default function ActivitesSection({
  activites, wishlistIds, voyageId,
}: {
  activites: Activite[]
  wishlistIds: string[]
  voyageId: string
}) {
  const [selectedVille, setSelectedVille] = useState('Toutes')
  const [selectedCategorie, setSelectedCategorie] = useState('Toutes')
  const [showWishlistOnly, setShowWishlistOnly] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set(wishlistIds))

  // Ferme l'activité ouverte si on clique en dehors d'elle
  useEffect(() => {
    if (!expandedId) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const clickedId = target.closest<HTMLElement>('[data-activite-id]')?.dataset.activiteId ?? null
      if (clickedId !== expandedId) setExpandedId(null)
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [expandedId])

  const villes = useMemo(
    () => Array.from(new Set(activites.map(a => a.ville))).sort(),
    [activites]
  )
  const categories = useMemo(
    () => Array.from(new Set(activites.map(a => a.categorie))).filter(c => CATEGORIES[c]),
    [activites]
  )

  const filtered = activites.filter(a =>
    (selectedVille === 'Toutes' || a.ville === selectedVille) &&
    (selectedCategorie === 'Toutes' || a.categorie === selectedCategorie) &&
    (!showWishlistOnly || wishlist.has(a.id))
  )

  function toggleWishlist(e: React.MouseEvent, activiteId: string) {
    e.stopPropagation()
    const isIn = wishlist.has(activiteId)
    setWishlist(prev => {
      const next = new Set(prev)
      if (isIn) next.delete(activiteId)
      else next.add(activiteId)
      return next
    })
    toggleWishlistActivite(voyageId, activiteId, !isIn).then(result => {
      if (result?.error) {
        // Rollback : le serveur a refusé, on remet l'état précédent
        setWishlist(prev => {
          const next = new Set(prev)
          if (isIn) next.add(activiteId)
          else next.delete(activiteId)
          return next
        })
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-base">🗺️ Activités &amp; Itinéraires</h2>
        <button onClick={() => setShowWishlistOnly(w => !w)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
          style={{ background: showWishlistOnly ? '#FEE2E2' : '#F3F4F6', color: showWishlistOnly ? '#EF4444' : '#6B7280' }}>
          <HeartIcon filled={wishlist.size > 0} size={14} />
          <span>{wishlist.size}</span>
        </button>
      </div>

      {/* Filtres : villes */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {['Toutes', ...villes].map(v => (
          <button key={v} onClick={() => setSelectedVille(v)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
            style={{ background: selectedVille === v ? '#1D4ED8' : '#F3F4F6', color: selectedVille === v ? 'white' : '#6B7280' }}>
            {v}
          </button>
        ))}
      </div>

      {/* Filtres : catégories */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setSelectedCategorie('Toutes')}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
          style={{ background: selectedCategorie === 'Toutes' ? '#1D4ED8' : '#F3F4F6', color: selectedCategorie === 'Toutes' ? 'white' : '#6B7280' }}>
          Toutes
        </button>
        {categories.map(c => (
          <button key={c} onClick={() => setSelectedCategorie(c)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
            style={{ background: selectedCategorie === c ? '#1D4ED8' : '#F3F4F6', color: selectedCategorie === c ? 'white' : '#6B7280' }}>
            {CATEGORIES[c].emoji} {CATEGORIES[c].label}
          </button>
        ))}
      </div>

      {/* Grille d'activités */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
          {showWishlistOnly ? 'Aucune activité dans la wishlist pour ces filtres.' : 'Aucune activité pour ces filtres.'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map(a => {
            const cat = CATEGORIES[a.categorie] ?? CATEGORIES.experience
            const isExpanded = expandedId === a.id
            const inWishlist = wishlist.has(a.id)

            return (
              <div key={a.id}
                onClick={() => setExpandedId(isExpanded ? null : a.id)}
                data-activite-id={a.id}
                className={`relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-gray-200 ${isExpanded ? 'col-span-3' : ''}`}>

                {/* Image / placeholder */}
                <div className="relative" style={{ aspectRatio: isExpanded ? '16/9' : '1/1' }}>
                  {a.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.photo_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: cat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: isExpanded ? '36px' : '20px' }}>{cat.emoji}</span>
                    </div>
                  )}

                  {/* Cœur wishlist */}
                  <button onClick={(e) => toggleWishlist(e, a.id)}
                    className="absolute top-1.5 right-1.5 flex items-center justify-center w-7 h-7 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.35)' }}>
                    <HeartIcon filled={inWishlist} size={14} />
                  </button>
                </div>

                {/* Titre, sur fond blanc sous l'image */}
                <div className="px-2.5 py-2.5 flex flex-col gap-2">
                  <p className="font-semibold text-gray-800 leading-snug line-clamp-3" style={{ fontSize: isExpanded ? '16px' : '13px' }}>
                    {a.titre}
                  </p>

                  {/* Détails (carte étendue) */}
                  {isExpanded && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {a.horaires && (
                          <span className="text-xs font-medium text-gray-600 bg-gray-50 rounded-full px-3 py-1.5">🕐 {a.horaires}</span>
                        )}
                        {a.tarifs && (
                          <span className="text-xs font-medium text-gray-600 bg-gray-50 rounded-full px-3 py-1.5">💰 {a.tarifs}</span>
                        )}
                      </div>
                      {a.description && (
                        <p className="text-sm text-gray-700 leading-relaxed">{a.description}</p>
                      )}
                      {a.notes && <NoteLines notes={a.notes} />}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
