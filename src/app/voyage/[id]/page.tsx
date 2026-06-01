import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VoyageEditButton from './VoyageEditButton'
import VoyageTabs from './VoyageTabs'
import ParticipantsPanel from './ParticipantsPanel'
import { quitterVoyage } from './quitter-actions'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dureeVoyage(depart: string, retour: string) {
  return Math.ceil((new Date(retour).getTime() - new Date(depart).getTime()) / (1000 * 60 * 60 * 24))
}

function joursAvantDepart(depart: string) {
  return Math.ceil((new Date(depart).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const DESTINATION_TO_CODE: Record<string, string> = {
  maroc: 'MA', japon: 'JP', 'thaïlande': 'TH', thailande: 'TH',
  portugal: 'PT', 'grèce': 'GR', grece: 'GR',
  'états-unis': 'US', 'etats-unis': 'US', usa: 'US',
  bali: 'ID', 'indonésie': 'ID', indonesie: 'ID',
  mexique: 'MX', italie: 'IT', 'sénégal': 'SN', senegal: 'SN',
}

function getPaysCode(code: string | null, destination: string): string | null {
  if (code) return code
  const key = destination.toLowerCase()
  for (const [pattern, c] of Object.entries(DESTINATION_TO_CODE)) {
    if (key.includes(pattern)) return c
  }
  return null
}

export default async function VoyagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // RLS gère l'accès (organisateur OU participant via policy 20240007)
  const { data: voyage } = await supabase
    .from('voyages').select('*').eq('id', id).single()

  if (!voyage) notFound()

  const isOrganisateur = voyage.user_id === user.id

  // Tous les participants du voyage
  const { data: participants } = await supabase
    .from('voyage_participants')
    .select('id, prenom, type, statut, token_invitation, compagnie_aerienne, user_id')
    .eq('voyage_id', id)
    .eq('role', 'participant')
    .order('created_at')

  // Identifier le participant courant (pour Mode B)
  const currentParticipant = isOrganisateur
    ? null
    : (participants ?? []).find(p => p.user_id === user.id) ?? null

  // Si ni organisateur ni participant → accès refusé
  if (!isOrganisateur && !currentParticipant) notFound()

  // Prénom de l'organisateur
  // Note: la RLS users n'autorise que la lecture de son propre profil.
  // Pour un participant Mode B, on lit le row 'organisateur' dans voyage_participants (s'il existe).
  let organizerPrenom = 'Organisateur'
  if (isOrganisateur) {
    const { data: orgProfile } = await supabase.from('users').select('prenom').eq('id', user.id).single()
    organizerPrenom = orgProfile?.prenom ?? user.user_metadata?.prenom ?? 'Organisateur'
  } else {
    const { data: orgRow } = await supabase
      .from('voyage_participants')
      .select('prenom')
      .eq('voyage_id', id)
      .eq('role', 'organisateur')
      .single()
    organizerPrenom = orgRow?.prenom ?? 'Organisateur'
  }

  // Liste complète des voyageurs (organisateur + participants) pour tricount / checklist
  const allTravelMembers = [
    { id: voyage.user_id, prenom: organizerPrenom, type: 'adulte' as const },
    ...(participants ?? []).map(p => ({ id: p.id, prenom: p.prenom, type: p.type as 'adulte' | 'enfant' })),
  ]

  // Membres de la valise selon le mode et le rôle
  const valiseMembers = (() => {
    if (!voyage.mode_gestion || voyage.mode_gestion === null) {
      // Solo ou ancien voyage sans mode
      return [{ id: voyage.user_id, prenom: organizerPrenom, type: 'adulte' as const }]
    }
    if (voyage.mode_gestion === 'A' && isOrganisateur) {
      // Mode A : l'organisateur gère tout le monde
      return allTravelMembers
    }
    if (voyage.mode_gestion === 'B' && isOrganisateur) {
      // Mode B organisateur : gère uniquement sa propre valise
      return [{ id: voyage.user_id, prenom: organizerPrenom, type: 'adulte' as const }]
    }
    if (voyage.mode_gestion === 'B' && currentParticipant) {
      // Mode B participant : gère uniquement sa propre valise
      return [{ id: currentParticipant.id, prenom: currentParticipant.prenom, type: currentParticipant.type as 'adulte' | 'enfant' }]
    }
    return [{ id: voyage.user_id, prenom: organizerPrenom, type: 'adulte' as const }]
  })()

  // Requêtes parallèles
  const checklist_filter = (() => {
    let q = supabase.from('checklist_items').select('*').eq('voyage_id', id).order('ordre')
    if (voyage.mode_gestion === 'B' && !isOrganisateur && currentParticipant) {
      // Participant Mode B : sa checklist personnelle
      return q.eq('participant_id', currentParticipant.id)
    }
    if (voyage.mode_gestion === 'B' && isOrganisateur) {
      // Organisateur Mode B : checklist partagée (sans participant_id)
      return q.is('participant_id', null)
    }
    return q
  })()

  const valise_filter = (() => {
    let q = supabase.from('valise_items').select('*').eq('voyage_id', id).order('ordre')
    if (voyage.mode_gestion === 'B') {
      const prenomFiltre = isOrganisateur ? organizerPrenom : currentParticipant?.prenom
      if (prenomFiltre) return q.eq('membre_prenom', prenomFiltre)
    }
    return q
  })()

  const [{ data: pays }, { data: checklist }, { data: membres }, { data: documents }, { data: depenses }, { data: valiseItems }] = await Promise.all([
    voyage.pays_code
      ? supabase.from('pays').select('*').eq('code', voyage.pays_code).single()
      : Promise.resolve({ data: null }),
    checklist_filter,
    // membres_foyer de l'organisateur (pour les documents)
    supabase.from('membres_foyer').select('id, prenom, type').eq('user_id', voyage.user_id),
    supabase.from('documents')
      .select('*, membre:membre_id(prenom)')
      .eq('user_id', isOrganisateur ? user.id : voyage.user_id)
      .or(`voyage_id.eq.${id},voyage_id.is.null`)
      .order('created_at', { ascending: false }),
    supabase.from('depenses')
      .select('*')
      .eq('voyage_id', id)
      .order('created_at', { ascending: false }),
    valise_filter,
  ])

  const jours = joursAvantDepart(voyage.date_depart)
  const duree = dureeVoyage(voyage.date_depart, voyage.date_retour)
  const code = getPaysCode(voyage.pays_code, voyage.destination)
  const photo = code ? `/images/pays/${code}.png` : null

  return (
    <div className="min-h-screen pb-8" style={{ background: '#EDE9FF' }}>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 text-lg">←</Link>
          <span className="font-semibold text-gray-800 truncate text-sm">{voyage.nom}</span>
          {!isOrganisateur && (
            <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
              Invité
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-4 flex flex-col gap-4">

        {/* Hero avec photo */}
        <div className="rounded-3xl overflow-hidden" style={{ aspectRatio: '16/9', position: 'relative', background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%)' }} />

          {/* Bouton édition (organisateur uniquement) */}
          {/* Bouton quitter (participants Mode B) */}
          {!isOrganisateur && voyage.mode_gestion === 'B' && currentParticipant && (
            <div style={{ position: 'absolute', top: 14, left: 14 }}>
              <form action={quitterVoyage.bind(null, currentParticipant.id)}>
                <button type="submit"
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
                  onClick={e => { if (!confirm('Quitter ce voyage ?')) e.preventDefault() }}>
                  ← Quitter
                </button>
              </form>
            </div>
          )}

          {isOrganisateur && (
            <VoyageEditButton
              voyage={{ id: voyage.id, nom: voyage.nom, destination: voyage.destination, date_depart: voyage.date_depart, date_retour: voyage.date_retour, membres_ids: voyage.membres_ids ?? [] }}
              membres={membres ?? []}
            />
          )}

          {/* Badge J- */}
          <div style={{ position: 'absolute', top: 14, right: 14 }}>
            {jours > 0 ? (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: jours <= 7 ? '#FEF3C7EE' : 'rgba(255,255,255,0.9)', color: jours <= 7 ? '#92400E' : '#534AB7' }}>
                J-{jours}
              </span>
            ) : (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#D1FAE5', color: '#065F46' }}>
                {jours === 0 ? "Aujourd'hui !" : 'En cours'}
              </span>
            )}
          </div>

          {/* Titre + infos */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
            <div className="flex items-center gap-2 mb-1">
              {pays?.emoji && <span className="text-2xl">{pays.emoji}</span>}
              <h1 style={{ fontWeight: 800, color: 'white', fontSize: '22px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textShadow: '0 2px 6px rgba(0,0,0,0.6)', margin: 0 }}>{voyage.nom}</h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0 }}>{voyage.destination}</p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', margin: '3px 0 0' }}>
              {formatDate(voyage.date_depart)} · {duree} jour{duree > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Panneau participants (organisateur uniquement, si voyage en groupe) */}
        {isOrganisateur && participants && participants.length > 0 && voyage.mode_gestion && (
          <ParticipantsPanel
            participants={participants}
            modeGestion={voyage.mode_gestion as 'A' | 'B'}
            voyageId={id}
          />
        )}

        {/* Onglets */}
        <VoyageTabs
          pays={pays}
          checklist={checklist ?? []}
          documents={documents ?? []}
          membres={membres ?? []}
          allTravelMembers={allTravelMembers}
          valiseMembers={valiseMembers}
          voyageId={id}
          voyageNom={voyage.nom}
          dateDepart={voyage.date_depart}
          dateRetour={voyage.date_retour}
          compagnie={currentParticipant?.compagnie_aerienne ?? voyage.compagnie_aerienne ?? null}
          paysCode={voyage.pays_code ?? null}
          depenses={depenses ?? []}
          budgetTotal={voyage.budget_total ?? 0}
          valiseItems={valiseItems ?? []}
          jours={duree}
          typeVoyage={voyage.type_voyage ?? null}
          modeGestion={voyage.mode_gestion ?? null}
          isOrganisateur={isOrganisateur}
          currentParticipantId={currentParticipant?.id ?? null}
          voyageUserId={voyage.user_id}
        />

      </main>
    </div>
  )
}
