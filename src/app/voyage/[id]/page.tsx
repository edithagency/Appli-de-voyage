import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import VoyageEditButton from './VoyageEditButton'
import VoyageTabs from './VoyageTabs'
import { quitterVoyage } from './quitter-actions'
import { getPaysCode } from '@/lib/utils/paysCode'

const AVATAR_COLORS = ['#36A6B2', '#1D9E75', '#D97706', '#E11D48', '#2563EB', '#0D9488']

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dureeVoyage(depart: string, retour: string) {
  return Math.ceil((new Date(retour).getTime() - new Date(depart).getTime()) / (1000 * 60 * 60 * 24))
}

function joursAvantDepart(depart: string) {
  return Math.ceil((new Date(depart).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default async function VoyagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: voyage } = await supabase.from('voyages').select('*').eq('id', id).single()
  if (!voyage) notFound()

  const isOrganisateur = voyage.user_id === user.id

  // Tous les membres du voyage (organisateur compris — il a toujours sa propre ligne)
  const { data: tousLesMembresRaw } = await supabase
    .from('voyage_membres')
    .select('id, prenom, type, role, statut_invitation, token_invitation, token_expire_at, user_id, compagnie_aerienne, utilisateur:users(avatar_url, emoji_avatar)')
    .eq('voyage_id', id)
    .order('created_at')

  const tousLesMembres = (tousLesMembresRaw ?? []).map(m => {
    const utilisateur = Array.isArray(m.utilisateur) ? m.utilisateur[0] : m.utilisateur
    return { ...m, avatarUrl: utilisateur?.avatar_url ?? null, emoji: utilisateur?.emoji_avatar ?? null }
  })
  const currentMembre = tousLesMembres.find(m => m.user_id === user.id) ?? null

  if (!isOrganisateur && !currentMembre) notFound()

  // Membres gérés par le viewer courant : en mode organisateur, l'organisateur gère tout
  // le monde ; sinon (solo/partagé) chacun ne gère que soi-même.
  const membresGeres = (voyage.mode_gestion === 'organisateur' && isOrganisateur)
    ? tousLesMembres
    : (currentMembre ? [currentMembre] : tousLesMembres)

  const membresGeresIds = membresGeres.map(m => m.id)
  const currentMembreId = currentMembre?.id ?? tousLesMembres.find(m => m.role === 'organisateur')?.id ?? ''

  // Checklist_valises + items pour les membres gérés
  const { data: valisesRaw } = await supabase
    .from('checklist_valises')
    .select('id, voyage_membre_id, bagages_types')
    .in('voyage_membre_id', membresGeresIds.length > 0 ? membresGeresIds : ['00000000-0000-0000-0000-000000000000'])

  const valiseIds = (valisesRaw ?? []).map(v => v.id)
  const { data: itemsRaw } = await supabase
    .from('checklist_items')
    .select('id, valise_id, categorie, sous_categorie, label, description, quantite, obligatoire, completed')
    .in('valise_id', valiseIds.length > 0 ? valiseIds : ['00000000-0000-0000-0000-000000000000'])
    .order('ordre')

  const valises = (valisesRaw ?? []).map(v => {
    const membre = membresGeres.find(m => m.id === v.voyage_membre_id)!
    return {
      id: v.id,
      membre: { id: membre.id, prenom: membre.prenom, type: membre.type },
      items: (itemsRaw ?? []).filter(i => i.valise_id === v.id),
      bagagesTypes: v.bagages_types ?? [],
    }
  })

  // voyage_info_status pour les membres gérés
  const { data: infoStatusRows } = await supabase
    .from('voyage_info_status')
    .select('voyage_membre_id, info_id, completed')
    .in('voyage_membre_id', membresGeresIds.length > 0 ? membresGeresIds : ['00000000-0000-0000-0000-000000000000'])

  const infoStatusParPersonne: Record<string, Record<string, boolean>> = {}
  for (const row of infoStatusRows ?? []) {
    if (!row.completed) continue
    if (!infoStatusParPersonne[row.voyage_membre_id]) infoStatusParPersonne[row.voyage_membre_id] = {}
    infoStatusParPersonne[row.voyage_membre_id][row.info_id] = true
  }

  const [{ data: pays }, { data: documents }, { data: depensesRaw }, { data: activites }, { data: wishlist }] = await Promise.all([
    voyage.pays_code
      ? supabase.from('pays').select('*').eq('code', voyage.pays_code).single()
      : Promise.resolve({ data: null }),
    // RLS gère l'accès : propre policy (uploaded_by = auth.uid()) + policy mode partagé
    supabase.from('documents')
      .select('*, membre:belongs_to(prenom)')
      .or(`voyage_id.eq.${id},and(uploaded_by.eq.${user.id},voyage_id.is.null)`)
      .order('created_at', { ascending: false }),
    supabase.from('depenses')
      .select('*')
      .eq('voyage_id', id)
      .order('created_at', { ascending: false }),
    voyage.pays_code
      ? supabase.from('activites').select('*').eq('pays_code', voyage.pays_code).order('ville').order('ordre')
      : Promise.resolve({ data: null }),
    supabase.from('activite_wishlist').select('activite_id').eq('voyage_id', id),
  ])

  // Les dépenses sont stockées par voyage_membre_id ; on les ré-affiche par prénom
  const membreById = Object.fromEntries(tousLesMembres.map(m => [m.id, m.prenom]))
  const depenses = (depensesRaw ?? []).map(d => ({
    ...d,
    payeur_prenom: d.payeur_membre_id ? (membreById[d.payeur_membre_id] ?? '?') : '?',
    participants: (d.participants_membre_ids ?? []).map((mid: string) => membreById[mid] ?? '?'),
  }))

  const jours = joursAvantDepart(voyage.date_depart)
  const duree = dureeVoyage(voyage.date_depart, voyage.date_retour)
  const code = getPaysCode(voyage.pays_code, voyage.destination)
  const photo = code ? `/images/pays/${code}.png` : null
  const avatars = tousLesMembres.slice(0, 3)

  const codeDevise = pays?.devise?.match(/\(([A-Z]{3})\)/)?.[1] ?? null
  let tauxLive: number | null = null
  if (codeDevise && codeDevise !== 'EUR') {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/EUR', { next: { revalidate: 21600 } })
      if (res.ok) {
        const { rates } = await res.json()
        tauxLive = rates?.[codeDevise] ?? null
      }
    } catch {
      tauxLive = null
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">

      {/* IMAGE FIXE EN HAUT — hors de la zone qui scrolle, < 1/3 de l'écran */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: '27vh' }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 55%)' }} />

        {/* Boutons haut gauche : retour + édition/quitter */}
        <div className="absolute top-4 left-4 flex items-center gap-0.5">
          <Link href="/dashboard" className="flex items-center justify-center" style={{ padding: 8 }}>
            <ArrowLeft size={16} color="white" />
          </Link>

          {!isOrganisateur && voyage.mode_gestion === 'partage' && currentMembre && (
            <form action={quitterVoyage.bind(null, currentMembre.id)}>
              <button type="submit"
                className="flex items-center justify-center"
                style={{ padding: 8 }}
                onClick={e => { if (!confirm('Quitter ce voyage ?')) e.preventDefault() }}>
                <LogOut size={16} color="white" />
              </button>
            </form>
          )}

          {isOrganisateur && (
            <VoyageEditButton
              voyage={{ id: voyage.id, nom: voyage.nom, destination: voyage.destination, date_depart: voyage.date_depart, date_retour: voyage.date_retour }}
              membres={tousLesMembres.filter(m => m.role === 'membre')}
              modeGestion={voyage.mode_gestion}
            />
          )}
        </div>

        {/* Badge J- haut droite */}
        <div className="absolute top-4 right-4">
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, color: 'white',
            background: jours > 0 && jours <= 7 ? '#2563EB' : jours > 0 ? '#93C5FD' : '#60A5FA',
          }}>
            {jours > 0 ? `J-${jours}` : jours === 0 ? "Aujourd'hui !" : 'En cours'}
          </span>
          {!isOrganisateur && (
            <div className="mt-1.5">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.9)', color: 'white' }}>
                Invité
              </span>
            </div>
          )}
        </div>

        {/* Titre + date, même format que les cartes du dashboard */}
        <div className="absolute" style={{ bottom: 36, left: 14 }}>
          <p className="text-white font-bold" style={{ fontSize: 22, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            {voyage.nom}
          </p>
          <p className="text-white" style={{ fontSize: 13, fontWeight: 400, opacity: 0.85, marginTop: 2 }}>
            {formatDate(voyage.date_depart)} · {duree} jour{duree > 1 ? 's' : ''}
          </p>
        </div>

        {/* Avatars (3 max, le premier au-dessus) */}
        <div className="absolute flex items-center" style={{ bottom: 36, right: 12 }}>
          {avatars.map((m, i) => (
            <div key={m.id} className="flex items-center justify-center text-white overflow-hidden"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                marginLeft: i > 0 ? -8 : 0, background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                fontSize: 13, fontWeight: 600, zIndex: avatars.length - i,
              }}>
              {m.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : m.emoji ?? m.prenom[0].toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* CONTENU — seule zone scrollable de la page */}
      <div className="voyage-scroll-area relative flex-1 overflow-y-auto bg-white" style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
        <main className="max-w-2xl mx-auto px-5 pb-28 flex flex-col gap-4">

          <VoyageTabs
            pays={pays}
            documents={documents ?? []}
            tousLesMembres={tousLesMembres.map(m => ({ id: m.id, prenom: m.prenom, type: m.type as 'adulte' | 'enfant', avatarUrl: m.avatarUrl, emoji: m.emoji }))}
            membresGeres={membresGeres.map(m => ({ id: m.id, prenom: m.prenom, type: m.type as 'adulte' | 'enfant', avatarUrl: m.avatarUrl, emoji: m.emoji }))}
            valises={valises}
            voyageId={id}
            voyageNom={voyage.nom}
            dateDepart={voyage.date_depart}
            dateRetour={voyage.date_retour}
            compagnie={currentMembre?.compagnie_aerienne ?? voyage.compagnie_aerienne ?? null}
            paysCode={voyage.pays_code ?? null}
            depenses={depenses}
            budgetTotal={voyage.budget_total ?? 0}
            activites={activites ?? []}
            wishlistActiviteIds={(wishlist ?? []).map(w => w.activite_id)}
            tauxLive={tauxLive}
            infoStatusParPersonne={infoStatusParPersonne}
            jours={duree}
            modeGestion={voyage.mode_gestion}
            isOrganisateur={isOrganisateur}
            currentMembreId={currentMembreId}
          />
        </main>
      </div>
    </div>
  )
}
