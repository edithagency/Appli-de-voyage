import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NouveauVoyageForm from './NouveauVoyageForm'
import PageHeader from '@/components/PageHeader'
export default async function NouveauVoyagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: pays } = await supabase.from('pays').select('code, nom_fr, emoji').order('nom_fr')

  return (
    <div className="min-h-screen pb-28" style={{ background: '#FFFFFF' }}>
      <header className="bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto pt-5 sm:pt-11 flex justify-center">
          <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="h-7" />
        </div>
        <PageHeader title="Nouveau voyage" />
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
        <div className="mt-4">
          <NouveauVoyageForm pays={pays ?? []} />
        </div>
      </main>

    </div>
  )
}
