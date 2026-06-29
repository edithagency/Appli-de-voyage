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
    <div className="h-full flex flex-col overflow-hidden bg-white">

      <header className="bg-white px-4 shrink-0">
        <div className="max-w-2xl mx-auto pt-5 sm:pt-11 pb-6 flex justify-center">
          <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="h-7" />
        </div>
      </header>

      {/* IMAGE FIXE EN HAUT — hors de la zone qui scrolle */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: '20vh' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/compte/hero.jpg" alt="" className="w-full h-full object-cover object-center" />
      </div>

      {/* CONTENU — seule zone scrollable de la page */}
      <div className="relative flex-1 overflow-y-auto bg-white" style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
        <main className="max-w-2xl mx-auto px-4 pt-6 pb-28 flex flex-col gap-5">

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

    </div>
  )
}
