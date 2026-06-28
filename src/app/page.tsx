import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: '#FFFFFF' }}>
      <div className="max-w-xl">
        <h1 className="sr-only">Bon Vol</h1>
        <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="w-32 sm:w-36 mx-auto mb-6" />
        <p className="text-lg text-gray-600 mb-8">
          Préparez votre voyage sereinement.<br />
          Visa, documents, activités... tout en un.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/signup"
            className="w-full px-8 py-3 rounded-full font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}
          >
            S&apos;inscrire gratuitement
          </Link>
          <Link
            href="/auth/login"
            className="w-full px-8 py-3 rounded-full font-semibold border-2 border-[#1D4ED8] text-[#1D4ED8] hover:bg-blue-50 transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  )
}
