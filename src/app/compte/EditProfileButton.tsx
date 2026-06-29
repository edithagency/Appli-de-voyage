'use client'

import { useState } from 'react'
import { Pencil, ChevronRight } from 'lucide-react'
import { sauvegarderProfil, changerMotDePasse } from './actions'

export default function EditProfileButton({
  initialPrenom, initialNom,
}: {
  initialPrenom: string
  initialNom: string
}) {
  const [open, setOpen] = useState(false)

  const [prenom, setPrenom] = useState(initialPrenom)
  const [nom, setNom] = useState(initialNom)
  const [infoPending, setInfoPending] = useState(false)
  const [infoSaved, setInfoSaved] = useState(false)
  const [infoError, setInfoError] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwPending, setPwPending] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  function handleClose() {
    setOpen(false)
    setPassword('')
    setConfirm('')
    setPwSaved(false)
    setPwError(null)
    setInfoSaved(false)
    setInfoError(null)
  }

  async function handleSaveInfo() {
    setInfoError(null)
    setInfoSaved(false)
    setInfoPending(true)
    const result = await sauvegarderProfil({ prenom, nom })
    setInfoPending(false)
    if (result.error) { setInfoError(result.error); return }
    setInfoSaved(true)
  }

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

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button type="button" onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 transition hover:bg-gray-50">
          <span className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
            style={{ background: 'rgba(54,166,178,0.12)' }}>
            <Pencil size={17} color="#36A6B2" />
          </span>
          <span className="flex-1 text-left text-sm font-medium text-gray-800">Éditer mon profil</span>
          <ChevronRight size={16} color="#D1D5DB" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={handleClose}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between -mb-2">
              <h3 className="font-bold text-gray-900 text-lg">Éditer mon profil</h3>
              <button onClick={handleClose} className="text-gray-300 text-2xl">×</button>
            </div>

            {/* Identité */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identité</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Prénom</label>
                  <input
                    value={prenom}
                    onChange={e => setPrenom(e.target.value)}
                    placeholder="Marie"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
                  <input
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    placeholder="Dupont"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]"
                  />
                </div>
              </div>
              {infoError && <p className="text-red-500 text-xs">{infoError}</p>}
              {infoSaved && <p className="text-green-600 text-xs font-medium">✓ Enregistré</p>}
              <button type="button" onClick={handleSaveInfo} disabled={infoPending}
                className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
                {infoPending ? 'Enregistrement...' : 'Enregistrer le nom'}
              </button>
            </div>

            <div className="border-t border-gray-100" />

            {/* Mot de passe */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mot de passe</h4>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Nouveau mot de passe (8 caractères min.)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]" />
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]" />
              {pwError && <p className="text-red-500 text-xs">{pwError}</p>}
              {pwSaved && <p className="text-green-600 text-xs font-medium">✓ Mot de passe mis à jour</p>}
              <button type="button" onClick={handleChangePassword} disabled={pwPending || !password}
                className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
                {pwPending ? 'Enregistrement...' : 'Changer le mot de passe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
