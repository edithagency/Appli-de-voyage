'use client'

import { useState, useRef } from 'react'
import { uploadDocument, supprimerDocument, getSignedUrl } from '@/app/coffre-fort/actions'

type Doc = {
  id: string
  type: string
  nom_fichier: string
  storage_path: string
  date_expiration: string | null
  voyage_id: string | null
  membre: { prenom: string } | null
}

type Membre = { id: string; prenom: string; type: string }

const TYPES = [
  { value: 'passeport', label: 'Passeport', emoji: '🛂' },
  { value: 'carte_identite', label: "Carte d'identité", emoji: '🪪' },
  { value: 'visa', label: 'Visa', emoji: '📋' },
  { value: 'billet_avion', label: "Billet d'avion", emoji: '✈️' },
  { value: 'reservation_hotel', label: 'Hôtel', emoji: '🏨' },
  { value: 'assurance', label: 'Assurance', emoji: '🛡️' },
  { value: 'carnet_vaccins', label: 'Vaccins', emoji: '💉' },
  { value: 'autorisation_sortie_territoire', label: 'AST', emoji: '📄' },
  { value: 'ordonnance', label: 'Ordonnance', emoji: '💊' },
  { value: 'autre', label: 'Autre', emoji: '📎' },
]

const TYPES_AVEC_EXPIRATION = ['passeport', 'carte_identite', 'visa', 'assurance']

function expirationStatus(dateStr: string | null) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { color: '#DC2626', bg: '#FEE2E2', label: 'Expiré' }
  if (diff < 180) return { color: '#D97706', bg: '#FEF3C7', label: `${diff}j` }
  return { color: '#1D9E75', bg: '#D1FAE5', label: '✓ Valide' }
}

function DocItem({ doc, onDelete }: { doc: Doc; onDelete: (id: string, path: string) => void }) {
  const [opening, setOpening] = useState(false)
  const meta = TYPES.find(t => t.value === doc.type) ?? { emoji: '📎', label: doc.type }
  const exp = expirationStatus(doc.date_expiration)

  async function handleOpen() {
    setOpening(true)
    const url = await getSignedUrl(doc.storage_path)
    if (url) window.open(url, '_blank')
    setOpening(false)
  }

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
        style={{ background: exp ? exp.bg : '#F3F4F6' }}>
        {meta.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">{meta.label}</span>
          {doc.membre && <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">{doc.membre.prenom}</span>}
          {doc.voyage_id ? (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Ce voyage</span>
          ) : (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Permanent</span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">{doc.nom_fichier}</p>
        {exp && <span className="text-xs font-semibold" style={{ color: exp.color }}>{exp.label}</span>}
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={handleOpen} disabled={opening}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-base transition"
          style={{ background: '#EDE9FF', color: '#534AB7' }}>
          {opening ? '…' : '👁️'}
        </button>
        <button onClick={() => onDelete(doc.id, doc.storage_path)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-base bg-red-50 text-red-400 hover:bg-red-100 transition">
          🗑️
        </button>
      </div>
    </div>
  )
}

export default function VoyageDocuments({
  documents, membres, voyageId
}: {
  documents: Doc[]
  membres: Membre[]
  voyageId: string
}) {
  const [docs, setDocs] = useState(documents)
  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState('passeport')
  const [forVoyage, setForVoyage] = useState(true)
  const [membreId, setMembreId] = useState<string>('tous')
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const needsExpiration = TYPES_AVEC_EXPIRATION.includes(type)
  const permanents = docs.filter(d => !d.voyage_id)
  const voyageDocs = docs.filter(d => d.voyage_id === voyageId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    if (!forVoyage) fd.delete('voyage_id')
    if (membreId !== 'tous') fd.set('membre_id', membreId)
    const result = await uploadDocument(fd)
    if (result?.error) {
      setError(result.error)
    } else {
      setShowModal(false)
      setFileName(null)
      formRef.current?.reset()
      setType('passeport')
      window.location.reload()
    }
    setLoading(false)
  }

  async function handleDelete(id: string, path: string) {
    if (!confirm('Supprimer ce document ?')) return
    setDocs(prev => prev.filter(d => d.id !== id))
    await supprimerDocument(id, path)
  }

  return (
    <div className="rounded-3xl border border-purple-100 overflow-hidden" style={{ background: '#EDE9FF' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100">
        <h2 className="font-bold text-gray-900">🔒 Documents</h2>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
          <span>+</span> Ajouter
        </button>
      </div>

      <div className="px-5">
        {/* Documents du voyage */}
        {voyageDocs.length > 0 && (
          <div className="py-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Ce voyage</p>
            {voyageDocs.map(d => <DocItem key={d.id} doc={d} onDelete={handleDelete} />)}
          </div>
        )}

        {/* Documents permanents */}
        {permanents.length > 0 && (
          <div className="py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Documents permanents</p>
            {permanents.map(d => <DocItem key={d.id} doc={d} onDelete={handleDelete} />)}
          </div>
        )}

        {docs.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-5xl mb-3">📁</div>
            <p className="text-sm text-gray-400">Aucun document pour ce voyage</p>
          </div>
        )}
      </div>

      {/* Modal upload */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Ajouter un document</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-300 text-2xl">×</button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input type="hidden" name="voyage_id" value={voyageId} />

              {/* Type de document */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type de document</p>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => setType(t.value)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left"
                      style={{ border: `2px solid ${type === t.value ? '#534AB7' : '#E5E7EB'}`, background: type === t.value ? '#EDE9FF' : '#F9FAFB', color: type === t.value ? '#534AB7' : '#6B7280' }}>
                      <span>{t.emoji}</span><span>{t.label}</span>
                    </button>
                  ))}
                </div>
                <input type="hidden" name="type" value={type} />
              </div>

              {/* Fichier */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ajoutez votre fichier</p>
                <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
                  style={{ borderColor: fileName ? '#534AB7' : '#E5E7EB', background: fileName ? '#EDE9FF' : '#FAFAFA' }}>
                  <span className="text-3xl">{fileName ? '✅' : '📎'}</span>
                  <span className="text-sm text-gray-500 text-center">{fileName ?? 'PDF, JPG ou PNG · max 10 Mo'}</span>
                  <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" required className="hidden"
                    onChange={e => setFileName(e.target.files?.[0]?.name ?? null)} />
                </label>
              </div>

              {/* Pour qui */}
              {membres.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pour qui ?</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setMembreId('tous')}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{ background: membreId === 'tous' ? '#534AB7' : '#EDE9FF', color: membreId === 'tous' ? 'white' : '#534AB7' }}>
                      Tout le monde
                    </button>
                    {membres.map(m => (
                      <button key={m.id} type="button" onClick={() => setMembreId(m.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{ background: membreId === m.id ? '#534AB7' : '#EDE9FF', color: membreId === m.id ? 'white' : '#534AB7' }}>
                        {m.prenom}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date expiration */}
              {needsExpiration && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date d'expiration</p>
                  <input type="date" name="date_expiration"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
                </div>
              )}

              {/* Document permanent */}
              <div onClick={() => setForVoyage(v => !v)}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl hover:bg-gray-100 transition"
                style={{ background: !forVoyage ? '#EDE9FF' : '#F9FAFB' }}>
                {/* Toggle CSS pur sans absolute */}
                <div className="shrink-0 flex items-center"
                  style={{
                    width: 44, height: 24,
                    borderRadius: 12,
                    background: !forVoyage ? '#534AB7' : '#D1D5DB',
                    padding: '2px',
                    boxSizing: 'border-box',
                    transition: 'background 0.2s',
                    justifyContent: !forVoyage ? 'flex-end' : 'flex-start',
                    display: 'flex',
                  }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', flexShrink: 0 }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: !forVoyage ? '#534AB7' : '#1F2937' }}>Document permanent</p>
                  <p className="text-xs text-gray-400 leading-tight">Passeport, carte d'identité… conservé après le voyage</p>
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
                {loading ? 'Enregistrement...' : 'Enregistrer le document'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
