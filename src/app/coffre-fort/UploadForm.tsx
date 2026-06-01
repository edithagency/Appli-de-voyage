'use client'

import { useState, useRef } from 'react'
import { uploadDocument } from './actions'

type Membre = { id: string; prenom: string; type: string }
type Voyage = { id: string; nom: string }

const TYPES = [
  { value: 'passeport', label: 'Passeport', emoji: '🛂' },
  { value: 'carte_identite', label: "Carte d'identité", emoji: '🪪' },
  { value: 'visa', label: 'Visa', emoji: '📋' },
  { value: 'billet_avion', label: "Billet d'avion", emoji: '✈️' },
  { value: 'reservation_hotel', label: 'Réservation hôtel', emoji: '🏨' },
  { value: 'assurance', label: 'Assurance voyage', emoji: '🛡️' },
  { value: 'carnet_vaccins', label: 'Carnet de vaccins', emoji: '💉' },
  { value: 'autorisation_sortie_territoire', label: 'Autorisation sortie territoire', emoji: '📄' },
  { value: 'ordonnance', label: 'Ordonnance', emoji: '💊' },
  { value: 'autre', label: 'Autre', emoji: '📎' },
]

const TYPES_AVEC_EXPIRATION = ['passeport', 'carte_identite', 'visa', 'assurance']

export default function UploadForm({ membres, voyages }: { membres: Membre[]; voyages: Voyage[] }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('passeport')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const needsExpiration = TYPES_AVEC_EXPIRATION.includes(type)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await uploadDocument(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
      setFileName(null)
      formRef.current?.reset()
      setType('passeport')
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-white shadow-md"
        style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
        <span className="text-lg">+</span> Ajouter un document
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Ajouter un document</h3>
              <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-600 text-2xl">×</button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Type de document</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => setType(t.value)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all text-left"
                      style={{
                        borderColor: type === t.value ? '#534AB7' : 'transparent',
                        background: type === t.value ? '#EDE9FF' : '#F9FAFB',
                        color: type === t.value ? '#534AB7' : '#6B7280',
                      }}>
                      <span>{t.emoji}</span><span>{t.label}</span>
                    </button>
                  ))}
                </div>
                <input type="hidden" name="type" value={type} />
              </div>

              {/* Fichier */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Fichier (PDF, JPG, PNG — max 10 Mo)</label>
                <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
                  style={{ borderColor: fileName ? '#534AB7' : '#E5E7EB', background: fileName ? '#EDE9FF' : '#FAFAFA' }}>
                  <span className="text-3xl">{fileName ? '✅' : '📎'}</span>
                  <span className="text-sm text-gray-500">{fileName ?? 'Appuie pour choisir un fichier'}</span>
                  <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" required
                    className="hidden"
                    onChange={e => setFileName(e.target.files?.[0]?.name ?? null)} />
                </label>
              </div>

              {/* Membre */}
              {membres.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Pour qui ?</label>
                  <select name="membre_id"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#534AB7]">
                    <option value="">Moi (général)</option>
                    {membres.map(m => (
                      <option key={m.id} value={m.id}>{m.prenom} ({m.type})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Voyage */}
              {voyages.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Voyage associé (optionnel)</label>
                  <select name="voyage_id"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#534AB7]">
                    <option value="">Document permanent</option>
                    {voyages.map(v => (
                      <option key={v.id} value={v.id}>{v.nom}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date d'expiration */}
              {needsExpiration && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Date d'expiration</label>
                  <input type="date" name="date_expiration"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
                {loading ? 'Upload...' : '⬆️ Enregistrer le document'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
