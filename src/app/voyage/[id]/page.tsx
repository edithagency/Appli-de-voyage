import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VoyageEditButton from './VoyageEditButton'
import VoyageTabs from './VoyageTabs'
import DerniereMiseAJour from '@/components/DerniereMiseAJour'
import { quitterVoyage } from './quitter-actions'
import { getPaysCode } from '@/lib/utils/paysCode'

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
    .select('id, prenom, type, role, statut_invitation, token_invitation, token_expire_at, user_id, compagnie_aerienne')
    .eq('voyage_id', id)
    .order('created_at')

  const tousLesMembres = tousLesMembresRaw ?? []
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
    <div className="min-h-screen pb-24" style={{ background: '#FEFCE8' }}>
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

        <div className="rounded-2xl overflow-hidden border border-gray-200" style={{ aspectRatio: '16/9', position: 'relative', background: 'linear-gradient(135deg, #147046, #25C490)' }}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%)' }} />

          {!isOrganisateur && voyage.mode_gestion === 'partage' && currentMembre && (
            <div style={{ position: 'absolute', top: 14, left: 14 }}>
              <form action={quitterVoyage.bind(null, currentMembre.id)}>
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
              voyage={{ id: voyage.id, nom: voyage.nom, destination: voyage.destination, date_depart: voyage.date_depart, date_retour: voyage.date_retour }}
              membres={tousLesMembres.filter(m => m.role === 'membre')}
              modeGestion={voyage.mode_gestion}
            />
          )}

          <div style={{ position: 'absolute', top: 14, right: 14 }}>
            {jours > 0 ? (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: jours <= 7 ? '#FEF3C7EE' : 'rgba(255,255,255,0.9)', color: jours <= 7 ? '#92400E' : '#147046' }}>
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
              {pays?.emoji && <span className="text-2xl">{pays.emoji}</span>}
              <h1 style={{ fontWeight: 800, color: 'white', fontSize: '22px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textShadow: '0 2px 6px rgba(0,0,0,0.6)', margin: 0 }}>{voyage.nom}</h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0 }}>{voyage.destination}</p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', margin: '3px 0 0' }}>
              {formatDate(voyage.date_depart)} · {duree} jour{duree > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <VoyageTabs
          pays={pays}
          documents={documents ?? []}
          tousLesMembres={tousLesMembres.map(m => ({ id: m.id, prenom: m.prenom, type: m.type as 'adulte' | 'enfant' }))}
          membresGeres={membresGeres.map(m => ({ id: m.id, prenom: m.prenom, type: m.type as 'adulte' | 'enfant' }))}
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

        <DerniereMiseAJour />
      </main>
    </div>
  )
}
