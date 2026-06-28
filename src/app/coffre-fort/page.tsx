import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CoffreFortClient from './CoffreFortClient'

export default async function CoffreFortPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Voyages propres + participations en parallèle
  const [{ data: ownDocs }, { data: ownVoyages }, { data: participations }] = await Promise.all([
    supabase.from('documents')
      .select('*, membre:belongs_to(prenom)')
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('voyages').select('id, nom').eq('user_id', user.id).order('date_depart', { ascending: false }),
    supabase.from('voyage_membres')
      .select('voyage_id, voyage:voyage_id(id, nom)')
      .eq('user_id', user.id)
      .eq('statut_invitation', 'joined'),
  ])

  // Membres des voyages dont l'utilisateur est l'organisateur (pour le "Pour qui ?")
  const { data: membres } = await supabase
    .from('voyage_membres')
    .select('id, prenom, type, voyage_id, voyages!inner(user_id)')
    .eq('voyages.user_id', user.id)

  // Voyages rejoints en tant que membre
  type VoyageRef = { id: string; nom: string }
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
  const allVoyages = [
    ...(ownVoyages ?? []),
    ...participatedVoyages.filter(v => !(ownVoyages ?? []).find(ov => ov.id === v.id)),
  ]

  const allDocs = [...(ownDocs ?? []), ...sharedDocs]

  return (
    <div className="min-h-screen pb-24" style={{ background: '#FFFFFF' }}>
      <header className="bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto pt-3 sm:pt-9 pb-2 flex justify-center">
          <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="h-7" />
        </div>
        <div className="max-w-2xl mx-auto flex items-center gap-3 pb-3">
          <Link href="/dashboard" className="text-gray-400 text-lg">←</Link>
          <span className="font-bold text-gray-800">🔒 Coffre-fort</span>
        </div>
      </header>

      <CoffreFortClient
        docs={allDocs}
        membres={(membres ?? []).map(m => ({ id: m.id, prenom: m.prenom, type: m.type }))}
        voyages={allVoyages}
      />
    </div>
  )
}
