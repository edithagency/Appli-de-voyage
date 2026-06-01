import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import CompteForm from './CompteForm'
import Link from 'next/link'

export default async function ComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('prenom, nom, profil_voyageur, type_voyage_prefere')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen pb-24" style={{ background: '#EDE9FF' }}>
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 text-lg">←</Link>
          <span className="font-semibold text-gray-800">Mon compte</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Avatar */}
        <div className="flex flex-col items-center pt-2 pb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3"
            style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
            {(profile?.prenom?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
          </div>
          <p className="font-bold text-gray-900 text-lg">
            {profile?.prenom ? `${profile.prenom}${profile.nom ? ' ' + profile.nom : ''}` : user.email}
          </p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        <CompteForm
          userId={user.id}
          initialPrenom={profile?.prenom ?? ''}
          initialNom={profile?.nom ?? ''}
          initialProfil={profile?.profil_voyageur ?? ''}
          initialTypeVoyage={profile?.type_voyage_prefere ?? ''}
        />

        {/* Déconnexion */}
        <form action={signout}>
          <button type="submit"
            className="w-full py-4 rounded-2xl font-semibold border-2 border-red-200 text-red-400 hover:bg-red-50 transition">
            Se déconnecter
          </button>
        </form>

        {/* Version */}
        <p className="text-center text-xs text-gray-300 pb-2">ReadyToFly · v1.0</p>
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
            <span className="text-xs text-gray-400 font-medium">Famille</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center gap-0.5 px-4 py-2">
            <span className="text-xl">👤</span>
            <span className="text-xs font-semibold" style={{ color: '#534AB7' }}>Compte</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
