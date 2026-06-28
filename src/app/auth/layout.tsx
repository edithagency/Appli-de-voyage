export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-hidden flex flex-col items-center px-4 pt-12 pb-4"
      style={{ background: '#FFFFFF' }}>
      <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="w-20 mb-4 shrink-0" />
      <div className="w-full max-w-md flex-1 flex flex-col justify-center min-h-0">
        {children}
      </div>
    </div>
  )
}
