export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-hidden flex flex-col items-center justify-center px-4 py-4"
      style={{ background: '#FFFFFF' }}>
      <div className="mb-3 flex flex-col items-center gap-1">
        <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="w-20" />
        <p className="text-xs text-gray-500">Préparez votre voyage sereinement</p>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
