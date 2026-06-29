'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock, ShieldCheck, HelpCircle, Download, Trash2, ChevronRight } from 'lucide-react'
import { signout } from '@/app/auth/actions'
import { changerMotDePasse, exporterDonnees } from './actions'

const SUPPORT_EMAIL = 'contact@readytofly.app'

function SettingsRow({
  icon: Icon, label, danger, onClick,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 transition hover:bg-gray-50">
      <span className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
        style={{ background: danger ? '#FEE2E2' : 'rgba(54,166,178,0.12)' }}>
        <Icon size={17} color={danger ? '#EF4444' : '#36A6B2'} />
      </span>
      <span className={`flex-1 text-left text-sm font-medium ${danger ? 'text-red-500' : 'text-gray-800'}`}>
        {label}
      </span>
      <ChevronRight size={16} color="#D1D5DB" />
    </button>
  )
}

export default function CompteSettings({ userEmail }: { userEmail: string }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwPending, setPwPending] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  async function handleChangePassword() {
    setPwError(null)
    if (password !== confirm) { setPwError('Les mots de passe ne correspondent pas.'); return }
    setPwPending(true)
    const result = await changerMotDePasse(password)
    setPwPending(false)
    if (result.error) { setPwError(result.error); return }
    setPwSaved(true)
    setPassword('')
    setConfirm('')
  }

  async function handleExport() {
    setExportError(null)
    setExporting(true)
    try {
      const result = await exporterDonnees()
      if (result.error || !result.data) { setExportError(result.error ?? 'Erreur lors de l\'export.'); return }
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bon-vol-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setExportError('Erreur lors de l\'export.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Sécurité */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        <SettingsRow icon={Lock} label="Mot de passe" onClick={() => { setShowPassword(true); setPwSaved(false); setPwError(null) }} />
        <Link href="/politique-confidentialite" className="block">
          <span className="w-full flex items-center gap-3 px-4 py-3.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-full shrink-0" style={{ background: 'rgba(54,166,178,0.12)' }}>
              <ShieldCheck size={17} color="#36A6B2" />
            </span>
            <span className="flex-1 text-left text-sm font-medium text-gray-800">Confidentialité</span>
            <ChevronRight size={16} color="#D1D5DB" />
          </span>
        </Link>
      </div>

      {/* Aide */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        <a href={`mailto:${SUPPORT_EMAIL}`} className="block">
          <span className="w-full flex items-center gap-3 px-4 py-3.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-full shrink-0" style={{ background: 'rgba(54,166,178,0.12)' }}>
              <HelpCircle size={17} color="#36A6B2" />
            </span>
            <span className="flex-1 text-left text-sm font-medium text-gray-800">Aide &amp; contact</span>
            <ChevronRight size={16} color="#D1D5DB" />
          </span>
        </a>
        <SettingsRow icon={Download} label={exporting ? 'Export en cours...' : 'Exporter mes données'} onClick={handleExport} />
      </div>
      {exportError && <p className="text-red-500 text-xs px-1 -mt-2">{exportError}</p>}

      {/* Zone de danger */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        <SettingsRow icon={Trash2} label="Supprimer mon compte" danger onClick={() => setShowDelete(true)} />
      </div>

      <form action={signout}>
        <button type="submit"
          className="w-full py-4 rounded-2xl font-semibold border border-red-200 text-red-400 hover:bg-red-50 transition">
          Se déconnecter
        </button>
      </form>

      {/* Modal mot de passe */}
      {showPassword && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowPassword(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Changer mon mot de passe</h3>
              <button onClick={() => setShowPassword(false)} className="text-gray-300 text-2xl">×</button>
            </div>

            {pwSaved ? (
              <p className="text-green-600 text-sm font-medium">✓ Mot de passe mis à jour.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Nouveau mot de passe (8 caractères min.)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]" />
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]" />
                {pwError && <p className="text-red-500 text-xs">{pwError}</p>}
                <button type="button" onClick={handleChangePassword} disabled={pwPending || !password}
                  className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
                  {pwPending ? 'Enregistrement...' : 'Mettre à jour'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal suppression de compte */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowDelete(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Supprimer mon compte</h3>
              <button onClick={() => setShowDelete(false)} className="text-gray-300 text-2xl">×</button>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              La suppression définitive d&apos;un compte et de toutes ses données (voyages, documents, checklists)
              n&apos;est pas encore automatisée — elle est traitée manuellement pour éviter toute erreur. Envoie-nous
              un email depuis ton adresse ({userEmail}) et on s&apos;en occupe sous 48h.
            </p>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Suppression de mon compte Bon Vol&body=Bonjour, je souhaite supprimer définitivement mon compte (${userEmail}) et toutes mes données.`}
              className="block w-full text-center py-3 rounded-2xl font-semibold text-white"
              style={{ background: '#EF4444' }}>
              Demander la suppression par email
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
