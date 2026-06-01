import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RejoindreForm from './RejoindreForm'

export default async function RejoindreVoyagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Chercher le participant via le token
  const { data: participant } = await supabase
    .from('voyage_participants')
    .select('id, prenom, type, statut, voyage_id')
    .eq('token_invitation', token)
    .single()

  if (!participant) notFound()

  if (participant.statut === 'rejoint') {
    redirect(`/voyage/${participant.voyage_id}`)
  }

  // Charger les infos du voyage
  const { data: voyage } = await supabase
    .from('voyages')
    .select('id, nom, destination, date_depart, date_retour, pays_code')
    .eq('id', participant.voyage_id)
    .single()

  if (!voyage) notFound()

  // Charger tous les participants du voyage pour le "qui es-tu ?"
  const { data: tousLesParticipants } = await supabase
    .from('voyage_participants')
    .select('id, prenom, type, statut')
    .eq('voyage_id', participant.voyage_id)
    .eq('role', 'participant')

  // Vérifier si l'utilisateur est déjà connecté
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #EDE9FF 0%, #EDE9FF 50%, #E0F5EE 100%)' }}>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">✈️</div>
          <h1 className="text-2xl font-bold" style={{ color: '#534AB7' }}>Tu es invité(e) !</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Rejoins le voyage <span className="font-semibold text-gray-700">{voyage.nom}</span>
          </p>
        </div>

        {/* Carte voyage */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
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
          {tousLesParticipants && tousLesParticipants.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Dans ce voyage :</p>
              <div className="flex flex-wrap gap-2">
                {tousLesParticipants.map(p => (
                  <span key={p.id} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${p.statut === 'rejoint' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.type === 'enfant' ? '👶' : '🧑'} {p.prenom}
                    {p.statut === 'rejoint' && ' ✓'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <RejoindreForm
          token={token}
          participantId={participant.id}
          participantPrenom={participant.prenom}
          voyageId={voyage.id}
          isLoggedIn={!!user}
          userEmail={user?.email ?? null}
        />
      </div>
    </div>
  )
}
