import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NouveauVoyageForm from './NouveauVoyageForm'

export default async function NouveauVoyagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: pays }, { data: membresFoyer }, { data: profile }] = await Promise.all([
    supabase.from('pays').select('code, nom_fr, emoji').order('nom_fr'),
    supabase.from('membres_foyer').select('id, prenom, type').eq('user_id', user.id),
    supabase.from('users').select('profil_voyageur').eq('id', user.id).single(),
  ])

  return (
    <div className="min-h-screen" style={{ background: '#EDE9FF' }}>
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</a>
          <span className="text-gray-200">|</span>
          <span className="font-semibold text-gray-800">Nouveau voyage</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <NouveauVoyageForm
          pays={pays ?? []}
          membresFoyer={membresFoyer ?? []}
          profilVoyageur={profile?.profil_voyageur ?? null}
        />
      </main>
    </div>
  )
}
