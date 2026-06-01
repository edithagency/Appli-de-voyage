export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #EDE9FF 0%, #EDE9FF 50%, #E0F5EE 100%)' }}>
      <div className="mb-6 flex items-center gap-2">
        <span className="text-2xl">✈️</span>
        <span className="text-xl font-bold" style={{ color: '#534AB7' }}>ReadyToFly</span>
      </div>
      <div className="w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}
