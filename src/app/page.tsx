import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="h-full overflow-hidden relative flex flex-col items-center justify-center px-4 text-center"
      style={{ background: '#FFFFFF' }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        src="/videos/bon-vol.mp4"
      />
      <div className="max-w-xl -mt-12 relative z-10">
        <h1 className="sr-only">Bon Vol</h1>
        <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="w-32 sm:w-36 mx-auto mb-6" />
        <p className="text-sm text-gray-600 mb-6">
          Préparez votre voyage sereinement.<br />
          Visa, documents, activités... tout en un.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/auth/signup"
            className="w-full px-6 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)', boxShadow: '0 4px 12px rgba(54, 166, 178, 0.35)' }}
          >
            S&apos;inscrire gratuitement
          </Link>
          <Link
            href="/auth/login"
            className="w-full px-6 py-2.5 rounded-full text-sm font-semibold border-2 border-[#36A6B2] text-[#36A6B2] hover:bg-blue-50 transition"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  )
}
