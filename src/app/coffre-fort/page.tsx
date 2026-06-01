import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import UploadForm from './UploadForm'
import DocumentCard from './DocumentCard'

const TYPE_LABELS: Record<string, string> = {
  passeport: 'Passeport', carte_identite: "Carte d'identité", visa: 'Visa',
  billet_avion: "Billet d'avion", reservation_hotel: 'Hôtel', assurance: 'Assurance',
  carnet_vaccins: 'Vaccins', autorisation_sortie_territoire: 'AST',
  ordonnance: 'Ordonnance', autre: 'Autre',
}

export default async function CoffreFortPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: documents }, { data: membres }, { data: voyages }] = await Promise.all([
    supabase.from('documents')
      .select('*, membre:membre_id(prenom)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('membres_foyer').select('id, prenom, type').eq('user_id', user.id),
    supabase.from('voyages').select('id, nom').eq('user_id', user.id).eq('statut', 'en_preparation'),
  ])

  const docs = documents ?? []

  // Alertes : docs qui expirent dans < 180 jours
  const alertes = docs.filter(d => {
    if (!d.date_expiration) return false
    const diff = Math.ceil((new Date(d.date_expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return diff < 180
  })

  return (
    <div className="min-h-screen pb-24" style={{ background: '#EDE9FF' }}>
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 text-lg">←</Link>
          <span className="font-bold text-gray-800">🔒 Coffre-fort</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-5">

        {/* Header + bouton upload */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mes documents</h1>
            <p className="text-sm text-gray-400 mt-0.5">{docs.length} document{docs.length > 1 ? 's' : ''} stocké{docs.length > 1 ? 's' : ''}</p>
          </div>
          <UploadForm membres={membres ?? []} voyages={voyages ?? []} />
        </div>

        {/* Alertes expiration */}
        {alertes.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-800 text-sm mb-2">⚠️ {alertes.length} document{alertes.length > 1 ? 's' : ''} à renouveler</h2>
            <div className="flex flex-col gap-1">
              {alertes.map(d => {
                const diff = Math.ceil((new Date(d.date_expiration!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                return (
                  <p key={d.id} className="text-xs text-amber-700">
                    {TYPE_LABELS[d.type] ?? d.type} {d.membre?.prenom ? `(${d.membre.prenom})` : ''} — {diff < 0 ? 'Expiré' : `expire dans ${diff} jours`}
                  </p>
                )
              })}
            </div>
          </div>
        )}

        {/* Liste documents */}
        {docs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Aucun document</h2>
            <p className="text-gray-400 text-sm">Stocke tes passeports, visas, billets et assurances en sécurité.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {docs.map(doc => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}

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
            <span className="text-xs text-gray-400 font-medium">Compte</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
