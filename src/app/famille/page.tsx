import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import FamilleClient from './FamilleClient'

export default async function FamillePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: membres } = await supabase
    .from('membres_foyer')
    .select('id, prenom, date_naissance, type, groupe_sanguin, allergies, medicaments')
    .eq('user_id', user.id)
    .order('created_at')

  return (
    <div className="min-h-screen pb-24" style={{ background: '#EDE9FF' }}>
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 text-lg">←</Link>
          <span className="font-semibold text-gray-800">Mon foyer</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <FamilleClient userId={user.id} membresInitiaux={membres ?? []} />
      </main>

      {/* Nav bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-4 py-2">
            <span className="text-xl">🏠</span>
            <span className="text-xs text-gray-400 font-medium">Voyages</span>
          </Link>
          <Link href="/voyage/nouveau" className="flex flex-col items-center gap-0.5 px-4 py-2">
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
              style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>+</span>
            <span className="text-xs text-gray-400 font-medium">Nouveau</span>
          </Link>
          <Link href="/famille" className="flex flex-col items-center gap-0.5 px-4 py-2">
            <span className="text-xl">👨‍👩‍👧</span>
            <span className="text-xs font-semibold" style={{ color: '#534AB7' }}>Famille</span>
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
