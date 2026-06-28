import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DeleteVoyageButton from './DeleteVoyageButton'
import VoyagesPasses from './VoyagesPasses'
import DerniereMiseAJour from '@/components/DerniereMiseAJour'
import { getPaysCode } from '@/lib/utils/paysCode'
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function joursAvantDepart(dateDepart: string) {
  return Math.ceil((new Date(dateDepart).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function scoreColor(score: number) {
  if (score === 100) return { bar: '#1D9E75', text: '#065F46', bg: '#D1FAE5' }
  if (score >= 60) return { bar: '#1D4ED8', text: '#1D4ED8', bg: '#DBEAFE' }
  if (score >= 30) return { bar: '#D97706', text: '#92400E', bg: '#FEF3C7' }
  return { bar: '#E11D48', text: '#9F1239', bg: '#FFE4E6' }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: voyagesPropres }, { data: participations }, { data: paysList }] = await Promise.all([
    supabase.from('users').select('prenom').eq('id', user.id).single(),
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
    supabase.from('pays').select('code, emoji'),
  ])

  const CODE_TO_EMOJI: Record<string, string> = Object.fromEntries(
    (paysList ?? []).map(p => [p.code, p.emoji ?? ''])
  )

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
    ...voyagesEnCours.map(v => ({ ...v, estInvite: false })),
    ...((voyagesPartages ?? []).filter(v => !voyagesEnCours.find(vp => vp.id === v.id)).map(v => ({ ...v, estInvite: true }))),
  ]

  // Sépare les voyages à venir / en cours des voyages passés (date de retour révolue)
  const maintenant = Date.now()
  const tousLesVoyages = tousLesVoyagesBruts
    .filter(v => v.statut !== 'termine' && new Date(v.date_retour).getTime() >= maintenant)
    .sort((a, b) => new Date(a.date_depart).getTime() - new Date(b.date_depart).getTime())

  const voyagesPasses = tousLesVoyagesBruts
    .filter(v => v.statut === 'termine' || new Date(v.date_retour).getTime() < maintenant)
    .sort((a, b) => new Date(b.date_depart).getTime() - new Date(a.date_depart).getTime())

  // Ma propre valise pour chaque voyage (organisateur ou membre invité — j'ai toujours
  // une ligne voyage_membres) : la progression affichée sur le dashboard est la mienne.
  const progressions: Record<string, { total: number; done: number }> = {}
  if (tousLesVoyages.length > 0) {
    const { data: mesMembres } = await supabase
      .from('voyage_membres')
      .select('id, voyage_id')
      .in('voyage_id', tousLesVoyages.map(v => v.id))
      .eq('user_id', user.id)

    const membreIdParVoyage: Record<string, string> = {}
    for (const m of mesMembres ?? []) membreIdParVoyage[m.voyage_id] = m.id

    const { data: mesValises } = await supabase
      .from('checklist_valises')
      .select('id, voyage_membre_id')
      .in('voyage_membre_id', Object.values(membreIdParVoyage))

    const valiseIdParMembre: Record<string, string> = {}
    for (const v of mesValises ?? []) valiseIdParMembre[v.voyage_membre_id] = v.id

    const valiseIds = Object.values(valiseIdParMembre)
    const { data: allItems } = valiseIds.length > 0
      ? await supabase.from('checklist_items').select('valise_id, completed').in('valise_id', valiseIds)
      : { data: [] }

    for (const voyage of tousLesVoyages) {
      const membreId = membreIdParVoyage[voyage.id]
      const valiseId = membreId ? valiseIdParMembre[membreId] : undefined
      const items = (allItems ?? []).filter(i => i.valise_id === valiseId)
      progressions[voyage.id] = { total: items.length, done: items.filter(i => i.completed).length }
    }
  }

  const prenom = profile?.prenom ?? user.email?.split('@')[0]

  return (
    <div className="min-h-screen pb-24" style={{ background: '#FFFFFF' }}>

      {/* Header mobile */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <span className="font-bold text-lg" style={{ color: '#1D4ED8' }}>Bon Vol</span>
          </div>
          <Link href="/compte"
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}>
            {(prenom?.[0] ?? '?').toUpperCase()}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour {prenom} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">
            {tousLesVoyages.length === 0
              ? 'Prêt à planifier ton prochain voyage ?'
              : `${tousLesVoyages.length} voyage${tousLesVoyages.length > 1 ? 's' : ''} en préparation`}
          </p>
        </div>

        {/* Voyages */}
        {tousLesVoyages.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🗺️</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Aucun voyage en cours</h2>
            <p className="text-gray-400 text-sm mb-6">Crée ton premier voyage pour générer ta checklist.</p>
            <Link href="/voyage/nouveau"
              className="inline-block px-6 py-3 rounded-2xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}>
              + Créer un voyage
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tousLesVoyages.map(voyage => {
              const jours = joursAvantDepart(voyage.date_depart)
              const prog = progressions[voyage.id] ?? { total: 0, done: 0 }
              const score = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0
              const colors = scoreColor(score)
              const code = getPaysCode(voyage.pays_code, voyage.destination)
              const photo = code ? `/images/pays/${code}.png` : null
              const emoji = code ? CODE_TO_EMOJI[code] : null

              return (
                <Link key={voyage.id} href={`/voyage/${voyage.id}`}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">

                  {/* Image */}
                  <div style={{ position: 'relative', aspectRatio: '16/9', background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}>
                    {photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)' }} />

                    {/* Badge Invité */}
                    {voyage.estInvite && (
                      <div style={{ position: 'absolute', top: 12, left: 12 }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(59,130,246,0.9)', color: 'white' }}>
                          Invité
                        </span>
                      </div>
                    )}

                    {/* Badge J- */}
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: jours > 0 && jours <= 7 ? '#FEF3C7EE' : 'rgba(255,255,255,0.92)', color: jours > 0 && jours <= 7 ? '#92400E' : jours > 0 ? '#1D4ED8' : '#065F46' }}>
                        {jours > 0 ? `J-${jours}` : jours === 0 ? "Aujourd'hui !" : 'En cours'}
                      </span>
                    </div>

                    {/* Titre + pays */}
                    <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
                      <p style={{ fontWeight: 800, color: 'white', fontSize: '20px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textShadow: '0 2px 6px rgba(0,0,0,0.6)', margin: 0, lineHeight: 1.2 }}>
                        {voyage.nom}
                      </p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: '3px 0 0', fontWeight: 500 }}>
                        {emoji} {voyage.destination}
                      </p>
                    </div>
                  </div>

                  {/* Infos bas */}
                  <div className="px-4 py-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold" style={{ color: '#1D4ED8' }}>
                        {formatDate(voyage.date_depart)} - {formatDate(voyage.date_retour)}
                      </p>
                      {!voyage.estInvite && <DeleteVoyageButton voyageId={voyage.id} voyageNom={voyage.nom} />}
                    </div>
                    {prog.total > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                          <div className="h-full rounded-full" style={{ width: `${score}%`, background: colors.bar }} />
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                          style={{ background: colors.bg, color: colors.text }}>
                          {score}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-300">Checklist non générée</p>
                    )}
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
        style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}>
        +
      </Link>

    </div>
  )
}
