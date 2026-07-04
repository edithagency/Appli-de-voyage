type InfoType = 'erreur' | 'alerte' | 'info' | 'disclaimer'

const STYLES: Record<InfoType, { background: string; color: string }> = {
  erreur:     { background: '#faf3f0', color: '#6B7280' },
  alerte:     { background: '#fff5e0', color: '#6B7280' },
  info:       { background: '#F3F4F6', color: '#6B7280' },
  disclaimer: { background: '#fffde8', color: '#6B7280' },
}

export default function InfoBlock({ type, children }: { type: InfoType; children: React.ReactNode }) {
  return (
    <div style={{ ...STYLES[type], borderRadius: 12, padding: '10px 14px', fontSize: 12, fontWeight: 500, lineHeight: 1.5, fontStyle: 'italic', boxShadow: '0 4px 14px rgba(0,0,0,0.07)' }}>
      {children}
    </div>
  )
}
