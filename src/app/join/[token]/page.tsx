import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RejoindreForm from './RejoindreForm'

export default async function JoinVoyagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Chercher le membre via le token
  const { data: membre } = await supabase
    .from('voyage_membres')
    .select('id, prenom, type, statut_invitation, voyage_id, token_expire_at')
    .eq('token_invitation', token)
    .single()

  if (!membre) notFound()

  if (membre.statut_invitation === 'joined') {
    redirect(`/voyage/${membre.voyage_id}`)
  }

  const expire = membre.token_expire_at ? new Date(membre.token_expire_at) : null
  const estExpire = expire ? expire.getTime() < Date.now() : false

  if (estExpire) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center"
        style={{ background: '#FFFFFF' }}>
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="text-4xl mb-3">⏰</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Ce lien a expiré</h1>
          <p className="text-gray-500 text-sm">
            Ce lien d&apos;invitation n&apos;est plus valide. Demande à l&apos;organisateur du voyage
            de t&apos;envoyer une nouvelle invitation.
          </p>
        </div>
      </div>
    )
  }

  // Charger les infos du voyage
  const { data: voyage } = await supabase
    .from('voyages')
    .select('id, nom, destination, date_depart, date_retour, pays_code')
    .eq('id', membre.voyage_id)
    .single()

  if (!voyage) notFound()

  // Charger tous les membres du voyage pour le "qui es-tu ?"
  const { data: tousLesMembres } = await supabase
    .from('voyage_membres')
    .select('id, prenom, type, statut_invitation')
    .eq('voyage_id', membre.voyage_id)
    .eq('role', 'membre')

  // Vérifier si l'utilisateur est déjà connecté
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: '#FFFFFF' }}>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">✈️</div>
          <h1 className="text-2xl font-bold" style={{ color: '#36A6B2' }}>Tu es invité(e) !</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Rejoins le voyage <span className="font-semibold text-gray-700">{voyage.nom}</span>
          </p>
        </div>

        {/* Carte voyage */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
              🌍
            </div>
            <div>
              <p className="font-bold text-gray-800">{voyage.nom}</p>
              <p className="text-sm text-gray-400">{voyage.destination}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(voyage.date_depart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                {' → '}
                {new Date(voyage.date_retour).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          {tousLesMembres && tousLesMembres.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Dans ce voyage :</p>
              <div className="flex flex-wrap gap-2">
                {tousLesMembres.map(m => (
                  <span key={m.id} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${m.statut_invitation === 'joined' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {m.type === 'enfant' ? '👶' : '🧑'} {m.prenom}
                    {m.statut_invitation === 'joined' && ' ✓'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <RejoindreForm
          token={token}
          membreId={membre.id}
          membrePrenom={membre.prenom}
          voyageId={voyage.id}
          isLoggedIn={!!user}
          userEmail={user?.email ?? null}
        />
      </div>
    </div>
  )
}
