export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-hidden flex flex-col items-center justify-center px-4 py-4"
      style={{ background: '#FFFFFF' }}>
      <div className="w-full max-w-md flex flex-col items-center min-h-0">
        <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="w-20 mb-3" />
        {children}
      </div>
    </div>
  )
}
