'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import VoyageEditButton from './VoyageEditButton'
import { quitterVoyage } from './quitter-actions'

const MAX_H = 280
const MIN_H = 110
const SCROLL_RANGE = 170

type Membre = {
  id: string
  prenom: string
  type: string
  statut_invitation: 'pending' | 'lien_copie' | 'joined'
  token_invitation: string
  token_expire_at: string | null
}

export default function VoyageHero({
  photo, paysEmoji, nom, destination, dateLabel, duree, jours,
  isOrganisateur, voyage, membres, modeGestion, isInvite,
  showQuitter, currentMembreId,
}: {
  photo: string | null
  paysEmoji: string | null
  nom: string
  destination: string
  dateLabel: string
  duree: number
  jours: number
  isOrganisateur: boolean
  voyage: { id: string; nom: string; destination: string; date_depart: string; date_retour: string }
  membres: Membre[]
  modeGestion: 'organisateur' | 'partage' | 'solo'
  isInvite: boolean
  showQuitter: boolean
  currentMembreId: string
}) {
  const [progress, setProgress] = useState(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const scrollEl = document.querySelector('.phone-screen')
    if (!scrollEl) return

    function onScroll() {
      if (frame.current !== null) return
      frame.current = requestAnimationFrame(() => {
        const p = Math.min(Math.max(scrollEl!.scrollTop / SCROLL_RANGE, 0), 1)
        setProgress(p)
        frame.current = null
      })
    }
    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    return () => scrollEl.removeEventListener('scroll', onScroll)
  }, [])

  const height = MAX_H - (MAX_H - MIN_H) * progress
  const titleSize = 22 - 6 * progress
  const subOpacity = Math.max(0, 1 - progress * 1.6)

  return (
    <div
      className="sticky top-0 z-20 overflow-hidden"
      style={{ height, background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%)' }} />

      {/* Retour */}
      <Link href="/dashboard"
        style={{ position: 'absolute', top: 14, left: 14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#111827', backdropFilter: 'blur(4px)' }}>
        ←
      </Link>

      {isOrganisateur && (
        <div style={{ position: 'absolute', top: 14, left: 56 }}>
          <VoyageEditButton voyage={voyage} membres={membres} modeGestion={modeGestion} />
        </div>
      )}

      {showQuitter && (
        <div style={{ position: 'absolute', top: 14, left: 56 }}>
          <form action={quitterVoyage.bind(null, currentMembreId)}>
            <button type="submit"
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
              onClick={e => { if (!confirm('Quitter ce voyage ?')) e.preventDefault() }}>
              ← Quitter
            </button>
          </form>
        </div>
      )}

      <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        {isInvite && (
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(59,130,246,0.9)', color: 'white' }}>
            Invité
          </span>
        )}
        {jours > 0 ? (
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: jours <= 7 ? '#FEF3C7EE' : 'rgba(255,255,255,0.9)', color: jours <= 7 ? '#92400E' : '#36A6B2' }}>
            J-{jours}
          </span>
        ) : (
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#D1FAE5', color: '#065F46' }}>
            {jours === 0 ? "Aujourd'hui !" : 'En cours'}
          </span>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <div className="flex items-center gap-2 mb-1">
          {paysEmoji && <span style={{ fontSize: titleSize }}>{paysEmoji}</span>}
          <h1 style={{ fontWeight: 800, color: 'white', fontSize: titleSize, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textShadow: '0 2px 6px rgba(0,0,0,0.6)', margin: 0 }}>
            {nom}
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, opacity: subOpacity }}>{destination}</p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', margin: '3px 0 0', opacity: subOpacity }}>
          {dateLabel} · {duree} jour{duree > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
