import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditProfileButton from './EditProfileButton'
import AvatarUploader from './AvatarUploader'
import InviteFriendsCard from './InviteFriendsCard'
import CompteSettings from './CompteSettings'

function formatDateLong(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('prenom, nom, emoji_avatar, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen pb-28" style={{ background: '#FFFFFF' }}>
      <header className="bg-white px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto pt-5 sm:pt-11 pb-6 flex justify-center">
          <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="h-7" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Avatar */}
        <div className="flex flex-col items-center pt-2 pb-4 gap-3">
          <AvatarUploader
            initialAvatarUrl={profile?.avatar_url ?? null}
            fallbackLetter={(profile?.emoji_avatar ?? profile?.prenom?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
          />
          <div className="flex flex-col items-center -mt-1">
            <p className="font-bold text-gray-900 text-lg">
              {profile?.prenom ? `${profile.prenom}${profile.nom ? ' ' + profile.nom : ''}` : user.email}
            </p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        <InviteFriendsCard />

        <EditProfileButton
          initialPrenom={profile?.prenom ?? ''}
          initialNom={profile?.nom ?? ''}
        />

        <CompteSettings userEmail={user.email ?? ''} />

        {/* Méta */}
        {user.created_at && (
          <p className="text-center text-xs text-gray-300 pb-2">Membre depuis le {formatDateLong(user.created_at)}</p>
        )}
      </main>

    </div>
  )
}
