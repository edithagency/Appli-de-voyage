import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="h-full overflow-hidden relative" style={{ background: '#000000' }}>
      <h1 className="sr-only">Bon Vol</h1>

      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/bon-vol.mp4"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.55) 100%)' }}
      />

      <div className="absolute top-14 sm:top-20 inset-x-0 flex flex-col items-center text-center px-6">
        <img src="/images/logo-bon-vol-white.png" alt="Bon Vol" className="w-40 sm:w-44 mb-10" />
        <p className="text-white text-sm font-bold leading-snug drop-shadow">
          Préparez votre voyage sereinement.<br />
          Visa, documents, activités... tout en un.
        </p>
      </div>

      <div
        className="absolute bottom-0 inset-x-0 px-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        <div
          className="w-full bg-white rounded-[2rem] px-5 py-5"
          style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)' }}
        >
          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            <Link
              href="/auth/signup"
              className="w-full px-6 py-3 rounded-full text-sm font-semibold text-white text-center"
              style={{ background: '#36A6B2', boxShadow: '0 4px 12px rgba(54, 166, 178, 0.35)' }}
            >
              S&apos;inscrire gratuitement
            </Link>
            <Link
              href="/auth/login"
              className="w-full px-6 py-[11px] rounded-full text-sm font-semibold border border-[#36A6B2] text-[#36A6B2] bg-white hover:bg-blue-50 transition text-center"
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
