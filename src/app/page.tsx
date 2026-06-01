import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'linear-gradient(135deg, #EDE9FF 0%, #EDE9FF 50%, #E0F5EE 100%)' }}>
      <div className="max-w-xl">
        <div className="text-6xl mb-6">✈️</div>
        <h1 className="text-4xl font-bold mb-3" style={{ color: '#534AB7' }}>ReadyToFly</h1>
        <p className="text-lg text-gray-600 mb-8">
          Préparez votre voyage sereinement. Checklist, documents, rappels — tout en un, gratuit.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 rounded-xl font-semibold border-2 border-[#534AB7] text-[#534AB7] hover:bg-purple-50 transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  )
}
