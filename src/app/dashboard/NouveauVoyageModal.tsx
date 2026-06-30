'use client'

import { useEffect, useState } from 'react'
import ModalShell from '@/components/ModalShell'
import NouveauVoyageForm from '../voyage/nouveau/NouveauVoyageForm'

type Pays = { code: string; nom_fr: string; emoji: string | null }

export default function NouveauVoyageModal({ pays }: { pays: Pays[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handler() { setOpen(true) }
    window.addEventListener('open-trip-modal', handler)
    return () => window.removeEventListener('open-trip-modal', handler)
  }, [])

  return (
    <ModalShell open={open} onClose={() => setOpen(false)} title="Ajouter un voyage">
      {/* ModalShell ne rend ses children que si open est vrai : NouveauVoyageForm se démonte
          à la fermeture et remonte frais à l'ouverture, donc repart toujours à l'étape 1. */}
      <NouveauVoyageForm pays={pays} onClose={() => setOpen(false)} />
    </ModalShell>
  )
}
