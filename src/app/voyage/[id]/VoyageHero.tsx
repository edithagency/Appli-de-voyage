import Link from 'next/link'
import VoyageEditButton from './VoyageEditButton'
import { quitterVoyage } from './quitter-actions'

const MAX_H = 380
const MIN_H = 210

type Membre = {
  id: string
  prenom: string
  type: string
  statut_invitation: 'pending' | 'lien_copie' | 'joined'
  token_invitation: string
  token_expire_at: string | null
}

export default function VoyageHero({
  photo, paysEmoji, nom, destination, duree, jours,
  isOrganisateur, voyage, membres, modeGestion, isInvite,
  showQuitter, currentMembreId,
}: {
  photo: string | null
  paysEmoji: string | null
  nom: string
  destination: string
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
  return (
    <>
      {/* Photo : seule cette couche rétrécit au scroll */}
      <div
        className="overflow-hidden"
        style={{ position: 'sticky', top: -(MAX_H - MIN_H), height: MAX_H, zIndex: 10, background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%)' }} />

        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <div className="flex items-center gap-2 mb-1">
            {paysEmoji && <span style={{ fontSize: 22 }}>{paysEmoji}</span>}
            <h1 style={{ fontWeight: 800, color: 'white', fontSize: 22, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textShadow: '0 2px 6px rgba(0,0,0,0.6)', margin: 0 }}>
              {nom}
            </h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {destination} · {duree} jour{duree > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Contrôles : couche fixe en haut de l'écran, ne bouge jamais */}
      <div
        className="flex items-center justify-between px-3.5"
        style={{ position: 'sticky', top: 0, height: 56, marginTop: -MAX_H, zIndex: 30 }}
      >
        <div className="flex items-center gap-2">
          <Link href="/dashboard"
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#111827', backdropFilter: 'blur(4px)' }}>
            ←
          </Link>

          {isOrganisateur && (
            <VoyageEditButton voyage={voyage} membres={membres} modeGestion={modeGestion} />
          )}

          {showQuitter && (
            <form action={quitterVoyage.bind(null, currentMembreId)}>
              <button type="submit"
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
                onClick={e => { if (!confirm('Quitter ce voyage ?')) e.preventDefault() }}>
                ← Quitter
              </button>
            </form>
          )}
        </div>

        <div className="flex items-center gap-1.5">
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
      </div>
    </>
  )
}
