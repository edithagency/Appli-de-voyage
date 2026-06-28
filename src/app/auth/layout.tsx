export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-hidden flex flex-col items-center justify-center px-4 py-4"
      style={{ background: '#FFFFFF' }}>
      <div className="mb-4 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">✈️</span>
          <span className="text-lg font-bold" style={{ color: '#1D4ED8' }}>Bon Vol</span>
        </div>
        <p className="text-xs text-gray-500">Préparez votre voyage sereinement</p>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
