import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaysCode } from '@/lib/utils/paysCode'
import RejoindreForm from './RejoindreForm'

export default async function JoinVoyagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Un seul lien pour tout le voyage : la personne qui le reçoit choisit
  // ensuite qui elle est parmi les participants pas encore rejoints.
  const { data: voyage } = await supabase
    .from('voyages')
    .select('id, nom, destination, date_depart, date_retour, pays_code, token_expire_at')
    .eq('token_invitation', token)
    .single()

  if (!voyage) notFound()

  const expire = voyage.token_expire_at ? new Date(voyage.token_expire_at) : null
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

  // Tous les participants prévus pour ce voyage, pour le "qui es-tu ?"
  const { data: tousLesMembres } = await supabase
    .from('voyage_membres')
    .select('id, prenom, type, statut_invitation, user_id')
    .eq('voyage_id', voyage.id)
    .eq('role', 'membre')

  const membres = tousLesMembres ?? []
  const membresDisponibles = membres.filter(m => m.statut_invitation !== 'joined')

  const code = getPaysCode(voyage.pays_code, voyage.destination)
  const photo = code ? `/images/pays/${code}.png` : null

  // Vérifier si l'utilisateur est déjà connecté — et déjà membre de ce voyage
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const dejaMembre = membres.some(m => m.user_id === user.id)
    if (dejaMembre) redirect(`/voyage/${voyage.id}`)
  }

  return (
    <div className="h-full overflow-hidden flex flex-col items-center justify-center px-4 py-8"
      style={{ background: '#FFFFFF' }}>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#36A6B2' }}>Tu es invité(e) !</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Rejoins le voyage <span className="font-semibold text-gray-700">{voyage.nom}</span>
          </p>
        </div>

        {/* Carte voyage */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
              style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="w-full h-full object-cover" />
              )}
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
          {membres.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Dans ce voyage :</p>
              <div className="flex flex-wrap gap-2">
                {membres.map(m => (
                  <span key={m.id} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${m.statut_invitation === 'joined' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {m.prenom}
                    {m.statut_invitation === 'joined' && ' ✓'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <RejoindreForm
          token={token}
          voyageId={voyage.id}
          membresDisponibles={membresDisponibles}
          isLoggedIn={!!user}
          userEmail={user?.email ?? null}
        />
      </div>
    </div>
  )
}
