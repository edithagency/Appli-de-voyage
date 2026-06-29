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

      {/* IMAGE FIXE EN HAUT — hors de la zone qui scrolle, logo + avatar/nom/email dessus */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: '33vh' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/compte/hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />

        <div className="absolute inset-x-0 top-0 pt-5 sm:pt-11 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="h-7" />
        </div>

        <div className="absolute inset-x-0 flex flex-col items-center gap-3" style={{ bottom: 64 }}>
          <AvatarUploader
            initialAvatarUrl={profile?.avatar_url ?? null}
            fallbackLetter={(profile?.emoji_avatar ?? profile?.prenom?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
          />
          <div className="flex flex-col items-center -mt-1">
            <p className="font-bold text-gray-900 text-lg">
              {profile?.prenom ? `${profile.prenom}${profile.nom ? ' ' + profile.nom : ''}` : user.email}
            </p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>

      {/* CONTENU — seule zone scrollable de la page */}
      <div className="relative flex-1 overflow-y-auto bg-white" style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
        <main className="max-w-2xl mx-auto px-4 pt-6 pb-28 flex flex-col gap-5">

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
