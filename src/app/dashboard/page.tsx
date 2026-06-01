import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import DeleteVoyageButton from './DeleteVoyageButton'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function joursAvantDepart(dateDepart: string) {
  return Math.ceil((new Date(dateDepart).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const CODE_TO_EMOJI: Record<string, string> = {
  MA: '🇲🇦', JP: '🇯🇵', TH: '🇹🇭', PT: '🇵🇹', GR: '🇬🇷',
  US: '🇺🇸', ID: '🇮🇩', MX: '🇲🇽', IT: '🇮🇹', SN: '🇸🇳',
}

const DESTINATION_TO_CODE: Record<string, string> = {
  maroc: 'MA', morocco: 'MA',
  japon: 'JP', japan: 'JP',
  'thaïlande': 'TH', thailande: 'TH', thailand: 'TH',
  portugal: 'PT',
  'grèce': 'GR', grece: 'GR', greece: 'GR',
  'états-unis': 'US', 'etats-unis': 'US', usa: 'US', 'united states': 'US',
  bali: 'ID', 'indonésie': 'ID', indonesie: 'ID', indonesia: 'ID',
  mexique: 'MX', mexico: 'MX',
  italie: 'IT', italy: 'IT',
  'sénégal': 'SN', senegal: 'SN',
}

function getPaysCode(paysCode: string | null, destination: string): string | null {
  if (paysCode) return paysCode
  const key = destination.toLowerCase().trim()
  for (const [pattern, code] of Object.entries(DESTINATION_TO_CODE)) {
    if (key.includes(pattern)) return code
  }
  return null
}

function scoreColor(score: number) {
  if (score === 100) return { bar: '#1D9E75', text: '#065F46', bg: '#D1FAE5' }
  if (score >= 60) return { bar: '#534AB7', text: '#534AB7', bg: '#EDE9FF' }
  if (score >= 30) return { bar: '#D97706', text: '#92400E', bg: '#FEF3C7' }
  return { bar: '#E11D48', text: '#9F1239', bg: '#FFE4E6' }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: voyagesPropres }, { data: participations }] = await Promise.all([
    supabase.from('users').select('prenom, profil_voyageur').eq('id', user.id).single(),
    supabase.from('voyages')
      .select('id, nom, destination, pays_code, date_depart, date_retour, statut')
      .eq('user_id', user.id)
      .eq('statut', 'en_preparation')
      .order('date_depart', { ascending: true }),
    // Voyages où l'utilisateur est invité (Mode B)
    supabase.from('voyage_participants')
      .select('voyage_id')
      .eq('user_id', user.id)
      .eq('statut', 'rejoint'),
  ])

  // Récupérer les voyages partagés (dont l'user est participant)
  const participationIds = (participations ?? []).map(p => p.voyage_id)
  let voyagesPartages: typeof voyagesPropres = []
  if (participationIds.length > 0) {
    const { data } = await supabase
      .from('voyages')
      .select('id, nom, destination, pays_code, date_depart, date_retour, statut')
      .in('id', participationIds)
      .eq('statut', 'en_preparation')
      .order('date_depart', { ascending: true })
    voyagesPartages = data ?? []
  }

  const voyagesEnCours = voyagesPropres ?? []
  // Fusionner les deux listes sans doublons
  const tousLesVoyages = [
    ...voyagesEnCours.map(v => ({ ...v, estInvite: false })),
    ...((voyagesPartages ?? []).filter(v => !voyagesEnCours.find(vp => vp.id === v.id)).map(v => ({ ...v, estInvite: true }))),
  ].sort((a, b) => new Date(a.date_depart).getTime() - new Date(b.date_depart).getTime())

  // Trouver les voyages Mode B où l'utilisateur est participant (pour filtrer la checklist)
  const voyagesOuJeSuisParticipant = new Set(
    (participations ?? []).map(p => p.voyage_id)
  )

  // Récupérer les participations avec leur id (pour filtrer la checklist par participant_id)
  const { data: mesParticipations } = await supabase
    .from('voyage_participants')
    .select('voyage_id, id')
    .eq('user_id', user.id)
    .eq('statut', 'rejoint')

  const participantIdParVoyage: Record<string, string> = {}
  for (const p of mesParticipations ?? []) {
    participantIdParVoyage[p.voyage_id] = p.id
  }

  const progressions: Record<string, { total: number; done: number }> = {}
  if (tousLesVoyages.length > 0) {
    for (const voyage of tousLesVoyages) {
      const isParticipant = voyagesOuJeSuisParticipant.has(voyage.id)
      const participantId = participantIdParVoyage[voyage.id]

      let q = supabase.from('checklist_items')
        .select('voyage_id, completed')
        .eq('voyage_id', voyage.id)

      // Mode B participant : ne compter que sa checklist personnelle
      if (isParticipant && participantId) {
        q = q.eq('participant_id', participantId)
      } else {
        // Organisateur ou solo : checklist partagée (sans participant_id)
        q = q.is('participant_id', null)
      }

      const { data: items } = await q
      progressions[voyage.id] = { total: items?.length ?? 0, done: items?.filter(i => i.completed).length ?? 0 }
    }
  }

  const prenom = profile?.prenom ?? user.email?.split('@')[0]

  return (
    <div className="min-h-screen pb-24" style={{ background: '#EDE9FF' }}>

      {/* Header mobile */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <span className="font-bold text-lg" style={{ color: '#534AB7' }}>ReadyToFly</span>
          </div>
          <form action={signout}>
            <button type="submit" className="text-sm text-gray-400 hover:text-gray-600 transition">
              Déconnexion
            </button>
          </form>
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
              style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
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
                  <div style={{ position: 'relative', aspectRatio: '16/9', background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
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
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: jours > 0 && jours <= 7 ? '#FEF3C7EE' : 'rgba(255,255,255,0.92)', color: jours > 0 && jours <= 7 ? '#92400E' : jours > 0 ? '#534AB7' : '#065F46' }}>
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
                      <p className="text-xs font-semibold" style={{ color: '#534AB7' }}>
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
      </main>

      {/* Navigation bas (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 safe-area-pb">
        <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-4 py-2">
            <span className="text-xl">🏠</span>
            <span className="text-xs font-semibold" style={{ color: '#534AB7' }}>Voyages</span>
          </Link>
          <Link href="/voyage/nouveau" className="flex flex-col items-center gap-0.5 px-4 py-2">
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
              style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>+</span>
            <span className="text-xs text-gray-400 font-medium">Nouveau</span>
          </Link>
          <Link href="/famille" className="flex flex-col items-center gap-0.5 px-4 py-2">
            <span className="text-xl">👨‍👩‍👧</span>
            <span className="text-xs text-gray-400 font-medium">Famille</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center gap-0.5 px-4 py-2">
            <span className="text-xl">👤</span>
            <span className="text-xs text-gray-400 font-medium">Compte</span>
          </Link>
        </div>
      </nav>

    </div>
  )
}
