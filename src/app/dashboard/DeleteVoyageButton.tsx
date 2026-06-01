'use client'

import { useState } from 'react'
import { supprimerVoyage } from '@/app/voyage/supprimerVoyage-action'

export default function DeleteVoyageButton({ voyageId, voyageNom }: { voyageId: string; voyageNom: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Supprimer "${voyageNom}" définitivement ?`)) return
    setLoading(true)
    await supprimerVoyage(voyageId)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-red-100 disabled:opacity-50"
      style={{ background: '#FEE2E2', color: '#F87171' }}
      title="Supprimer le voyage">
      {loading ? '...' : '×'}
    </button>
  )
}
