import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: '#FEFCE8' }}>
      <div className="max-w-xl">
        <div className="text-6xl mb-6">✈️</div>
        <h1 className="text-4xl font-bold mb-3" style={{ color: '#147046' }}>ReadyToFly</h1>
        <p className="text-lg text-gray-600 mb-8">
          Préparez votre voyage sereinement. Checklist, documents, rappels — tout en un, gratuit.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3 rounded-2xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #147046, #25C490)' }}
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 rounded-2xl font-semibold border-2 border-[#147046] text-[#147046] hover:bg-yellow-50 transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  )
}
