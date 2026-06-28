export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#FFFFFF' }}>
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">✈️</span>
          <span className="text-2xl font-bold" style={{ color: '#1D4ED8' }}>Bon Vol</span>
        </div>
        <p className="text-sm text-gray-500">Préparez votre voyage sereinement</p>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
