import Link from 'next/link'

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen pb-12" style={{ background: '#FEFCE8' }}>
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 text-lg">←</Link>
          <span className="font-semibold text-gray-800">Politique de confidentialité</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-6 text-sm text-gray-600 leading-relaxed">

          <p>
            ReadyToFly accorde une grande importance à la protection de tes données personnelles.
            Cette page explique quelles informations sont collectées, pourquoi, et comment elles sont utilisées.
          </p>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">📋 Données collectées</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Informations de compte : email, prénom, nom, mot de passe (chiffré).</li>
              <li>Profil voyageur : type de voyageur, préférences de voyage.</li>
              <li>Informations sur ton foyer : prénoms, dates de naissance, groupe sanguin, allergies, médicaments (pour les checklists santé).</li>
              <li>Informations sur tes voyages : destinations, dates, budget, dépenses, checklist et valise.</li>
              <li>Documents que tu choisis d&apos;ajouter dans ton coffre-fort (passeport, billets, assurance...).</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">🎯 Utilisation des données</h2>
            <p>
              Ces informations servent uniquement à faire fonctionner l&apos;application : générer tes checklists
              et ta valise personnalisées, suivre ton budget de voyage, organiser tes voyages en groupe et te
              donner accès à tes documents. Elles ne sont jamais vendues ni utilisées à des fins publicitaires.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">🔒 Stockage et sécurité</h2>
            <p>
              Les données sont hébergées chez Supabase, avec des règles d&apos;accès strictes (Row Level Security) :
              chaque utilisateur ne peut accéder qu&apos;à ses propres données, sauf lorsqu&apos;il invite explicitement
              des participants à un voyage partagé. Les documents du coffre-fort sont stockés dans un espace privé
              et chiffré, accessible uniquement à toi via des liens temporaires.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">👥 Partage avec d&apos;autres utilisateurs</h2>
            <p>
              Si tu organises un voyage en groupe, les informations nécessaires (checklist, valise, dépenses
              partagées) sont visibles par les participants que tu invites. Tes documents personnels et les
              informations de ton foyer restent privés et ne sont jamais partagés.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">⚖️ Tes droits</h2>
            <p>
              Tu peux à tout moment consulter et modifier tes informations depuis la page{' '}
              <Link href="/compte" className="underline hover:text-[#147046]">Mon compte</Link>.
              Pour exercer ton droit d&apos;accès, de rectification ou de suppression de tes données
              (conformément au RGPD), contacte-nous à l&apos;adresse{' '}
              <a href="mailto:contact@readytofly.app" className="underline hover:text-[#147046]">contact@readytofly.app</a>.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">🍪 Cookies</h2>
            <p>
              ReadyToFly utilise uniquement des cookies techniques nécessaires à l&apos;authentification et au bon
              fonctionnement de l&apos;application. Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
