import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CoffreFortClient from './CoffreFortClient'
import { getPaysCode } from '@/lib/utils/paysCode'

export default async function CoffreFortPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Voyages propres + participations en parallèle
  const [{ data: ownDocs }, { data: ownVoyages }, { data: participations }, { data: paysList }] = await Promise.all([
    supabase.from('documents')
      .select('*, membre:belongs_to(prenom)')
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('voyages').select('id, nom, pays_code, destination').eq('user_id', user.id).order('date_depart', { ascending: false }),
    supabase.from('voyage_membres')
      .select('voyage_id, voyage:voyage_id(id, nom, pays_code, destination)')
      .eq('user_id', user.id)
      .eq('statut_invitation', 'joined'),
    supabase.from('pays').select('code, emoji'),
  ])

  const CODE_TO_EMOJI: Record<string, string> = Object.fromEntries(
    (paysList ?? []).map(p => [p.code, p.emoji ?? ''])
  )

  // Membres des voyages dont l'utilisateur est l'organisateur (pour le "Pour qui ?")
  const { data: membres } = await supabase
    .from('voyage_membres')
    .select('id, prenom, type, voyage_id, voyages!inner(user_id)')
    .eq('voyages.user_id', user.id)

  // Voyages rejoints en tant que membre
  type VoyageRef = { id: string; nom: string; pays_code: string | null; destination: string }
  const participatedVoyages = (participations ?? [])
    .map(p => (p.voyage && !Array.isArray(p.voyage) ? p.voyage as unknown as VoyageRef : null))
    .filter((v): v is VoyageRef => v !== null)

  const participatedVoyageIds = participatedVoyages.map(v => v.id)

  // Docs partagés : voyage-specific des voyages rejoints (pas les propres — déjà dans ownDocs)
  // RLS autorise la lecture grâce à la policy "documents: lecture mode partage"
  let sharedDocs: Array<Record<string, unknown> & { _shared: true }> = []
  if (participatedVoyageIds.length > 0) {
    const { data } = await supabase.from('documents')
      .select('*, membre:belongs_to(prenom)')
      .in('voyage_id', participatedVoyageIds)
      .neq('uploaded_by', user.id)
      .order('created_at', { ascending: false })
    sharedDocs = (data ?? []).map(d => ({ ...d, _shared: true as const }))
  }

  // Liste complète des voyages pour les pills (propres + rejoints, sans doublon)
  const allVoyagesBruts = [
    ...(ownVoyages ?? []),
    ...participatedVoyages.filter(v => !(ownVoyages ?? []).find(ov => ov.id === v.id)),
  ]

  const allVoyages = allVoyagesBruts.map(v => {
    const code = getPaysCode(v.pays_code, v.destination)
    return { id: v.id, nom: v.nom, emoji: (code && CODE_TO_EMOJI[code]) || '✈️' }
  })

  const allDocs = [...(ownDocs ?? []), ...sharedDocs]

  return (
    <div className="min-h-screen pb-28" style={{ background: '#FFFFFF' }}>
      <header className="bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto pt-5 sm:pt-11 pb-5 flex justify-center">
          <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="h-7" />
        </div>
      </header>

      <CoffreFortClient
        docs={allDocs}
        membres={(membres ?? []).map(m => ({ id: m.id, prenom: m.prenom, type: m.type, voyage_id: m.voyage_id }))}
        voyages={allVoyages}
      />
    </div>
  )
}
