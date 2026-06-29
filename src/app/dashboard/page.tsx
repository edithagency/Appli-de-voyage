import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VoyagesPasses from './VoyagesPasses'
import DeleteVoyageButton from './DeleteVoyageButton'
import DerniereMiseAJour from '@/components/DerniereMiseAJour'
import { getPaysCode } from '@/lib/utils/paysCode'

const AVATAR_COLORS = ['#36A6B2', '#1D9E75', '#D97706', '#E11D48', '#2563EB', '#0D9488']

function formatDateLong(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dureeVoyage(depart: string, retour: string) {
  return Math.ceil((new Date(retour).getTime() - new Date(depart).getTime()) / (1000 * 60 * 60 * 24))
}

function joursAvantDepart(dateDepart: string) {
  return Math.ceil((new Date(dateDepart).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: voyagesPropres }, { data: participations }] = await Promise.all([
    supabase.from('voyages')
      .select('id, nom, destination, pays_code, date_depart, date_retour, statut')
      .eq('user_id', user.id)
      .order('date_depart', { ascending: true }),
    // Voyages où l'utilisateur est invité (en tant que membre, pas organisateur)
    supabase.from('voyage_membres')
      .select('voyage_id')
      .eq('user_id', user.id)
      .eq('role', 'membre')
      .eq('statut_invitation', 'joined'),
  ])

  // Récupérer les voyages partagés (dont l'user est participant)
  const participationIds = (participations ?? []).map(p => p.voyage_id)
  let voyagesPartages: typeof voyagesPropres = []
  if (participationIds.length > 0) {
    const { data } = await supabase
      .from('voyages')
      .select('id, nom, destination, pays_code, date_depart, date_retour, statut')
      .in('id', participationIds)
      .order('date_depart', { ascending: true })
    voyagesPartages = data ?? []
  }

  const voyagesEnCours = voyagesPropres ?? []
  // Fusionner les deux listes sans doublons
  const tousLesVoyagesBruts = [
    ...voyagesEnCours,
    ...(voyagesPartages ?? []).filter(v => !voyagesEnCours.find(vp => vp.id === v.id)),
  ]

  // Sépare les voyages à venir / en cours des voyages passés (date de retour révolue)
  const maintenant = Date.now()
  const tousLesVoyages = tousLesVoyagesBruts
    .filter(v => v.statut !== 'termine' && new Date(v.date_retour).getTime() >= maintenant)
    .sort((a, b) => new Date(a.date_depart).getTime() - new Date(b.date_depart).getTime())

  const voyagesPasses = tousLesVoyagesBruts
    .filter(v => v.statut === 'termine' || new Date(v.date_retour).getTime() < maintenant)
    .sort((a, b) => new Date(b.date_depart).getTime() - new Date(a.date_depart).getTime())

  // Membres de chaque voyage à venir, pour les avatars de la carte
  const membresParVoyage: Record<string, { id: string; prenom: string }[]> = {}
  if (tousLesVoyages.length > 0) {
    const { data: tousLesMembres } = await supabase
      .from('voyage_membres')
      .select('id, voyage_id, prenom')
      .in('voyage_id', tousLesVoyages.map(v => v.id))
      .order('created_at', { ascending: true })

    for (const m of tousLesMembres ?? []) {
      (membresParVoyage[m.voyage_id] ??= []).push({ id: m.id, prenom: m.prenom })
    }
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: '#FFFFFF' }}>

      {/* Header mobile */}
      <header className="bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto pt-5 sm:pt-11 flex justify-center">
          <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="h-7" />
        </div>
        <div className="max-w-2xl mx-auto px-2 mt-4 mb-6">
          <p className="text-2xl font-bold text-gray-900 leading-tight">
            Préparez vos<br />
            <span className="font-museo" style={{ color: '#36A6B2' }}>voyages</span>
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">

        {/* Voyages */}
        {tousLesVoyages.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🗺️</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Aucun voyage en cours</h2>
            <p className="text-gray-400 text-sm mb-6">Crée ton premier voyage pour générer ta checklist.</p>
            <Link href="/voyage/nouveau"
              className="inline-block px-6 py-3 rounded-2xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
              + Créer un voyage
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {tousLesVoyages.map(voyage => {
              const duree = dureeVoyage(voyage.date_depart, voyage.date_retour)
              const code = getPaysCode(voyage.pays_code, voyage.destination)
              const photo = code ? `/images/pays/${code}.png` : null
              const membres = membresParVoyage[voyage.id] ?? []
              const avatars = membres.slice(0, 3)
              const jours = joursAvantDepart(voyage.date_depart)

              return (
                <Link key={voyage.id} href={`/voyage/${voyage.id}`}
                  className="relative overflow-hidden block cursor-pointer"
                  style={{ height: 180, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', marginBottom: 16 }}>

                  {/* Image */}
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
                  ) : (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }} />
                  )}

                  {/* Dégradé */}
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
                  }} />

                  {/* Supprimer */}
                  <DeleteVoyageButton voyageId={voyage.id} voyageNom={voyage.nom} />

                  {/* Badge J- */}
                  <div className="absolute" style={{ top: 12, right: 12 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                      background: jours > 0 && jours <= 7 ? '#FFE4E6' : jours > 0 ? 'rgba(255,255,255,0.92)' : '#D1FAE5',
                      color: jours > 0 && jours <= 7 ? '#9F1239' : jours > 0 ? '#36A6B2' : '#065F46',
                    }}>
                      {jours > 0 ? `J-${jours}` : jours === 0 ? "Aujourd'hui !" : 'En cours'}
                    </span>
                  </div>

                  {/* Texte */}
                  <div className="absolute" style={{ bottom: 12, left: 14 }}>
                    <p className="text-white font-bold" style={{ fontSize: 22, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                      {voyage.nom}
                    </p>
                    <p className="text-white" style={{ fontSize: 13, fontWeight: 400, opacity: 0.85, marginTop: 2 }}>
                      {formatDateLong(voyage.date_depart)} · {duree} jour{duree > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Avatars (3 max, le premier au-dessus) */}
                  <div className="absolute flex items-center" style={{ bottom: 12, right: 12 }}>
                    {avatars.map((m, i) => (
                      <div key={m.id} className="flex items-center justify-center text-white"
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          marginLeft: i > 0 ? -8 : 0, background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                          fontSize: 13, fontWeight: 600, zIndex: avatars.length - i,
                        }}>
                        {m.prenom[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <VoyagesPasses voyages={voyagesPasses} />

        <DerniereMiseAJour />
      </main>

      <Link href="/voyage/nouveau"
        className="fixed right-5 bottom-24 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-light shadow-lg z-10"
        style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
        +
      </Link>

    </div>
  )
}
