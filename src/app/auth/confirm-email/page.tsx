import Link from 'next/link'

export default function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center">
      <div className="text-6xl mb-4">✉️</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Confirme ton email
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
        On t'a envoyé un lien de confirmation. Clique dessus pour activer ton compte.
      </p>
      <p className="text-gray-400 dark:text-gray-500 text-xs mb-8">
        Vérifie aussi tes spams si tu ne le vois pas.
      </p>

      <div className="bg-yellow-50 dark:bg-green-900/20 border border-yellow-100 dark:border-green-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-green-700 dark:text-green-300">
          Une fois confirmé, tu seras redirigé vers ReadyToFly pour finaliser ton profil.
        </p>
      </div>

      <Link
        href="/auth/login"
        className="text-[#147046] font-semibold hover:underline text-sm"
      >
        Déjà confirmé ? Se connecter →
      </Link>
    </div>
  )
}
