'use client'

import { useState } from 'react'
import DeviseGenerique from './DeviseGenerique'
import TailleConverter from './TailleConverter'
import DecalageHoraire from './DecalageHoraire'
import PermisGuide from './PermisGuide'
import MedicamentsTraducteur from './MedicamentsTraducteur'

const OUTILS = [
  {
    id: 'devise',
    emoji: '💱',
    titre: 'Convertisseur de devises',
    desc: 'Convertit instantanément entre 28 devises mondiales',
    premium: false,
    component: <DeviseGenerique />,
  },
  {
    id: 'tailles',
    emoji: '👕',
    titre: 'Convertisseur de tailles',
    desc: 'Chaussures et vêtements EU / UK / US / IT',
    premium: false,
    component: <TailleConverter />,
  },
  {
    id: 'horaire',
    emoji: '🕐',
    titre: 'Décalage horaire',
    desc: 'Heure locale en temps réel dans 30 villes',
    premium: false,
    component: <DecalageHoraire />,
  },
  {
    id: 'permis',
    emoji: '🚗',
    titre: 'Guide permis international',
    desc: 'Validité du permis FR par pays + comment obtenir un permis international',
    premium: true,
    component: <PermisGuide />,
  },
  {
    id: 'medicaments',
    emoji: '💊',
    titre: 'Traducteur de médicaments',
    desc: 'Nom générique + équivalents locaux par pays',
    premium: true,
    component: <MedicamentsTraducteur />,
  },
]

export default function OutilsPage() {
  const [open, setOpen] = useState<string | null>('devise')

  return (
    <div className="min-h-screen pb-24" style={{ background: '#FFFFFF' }}>
      <header className="bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto pt-2 pb-1 flex justify-center">
          <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="h-5" />
        </div>
        <div className="max-w-2xl mx-auto pb-3">
          <h1 className="text-lg font-bold text-gray-900">🛠️ Outils de voyage</h1>
          <p className="text-xs text-gray-400 mt-0.5">Utiles sur le terrain, même sans connexion</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-3">

        {/* Gratuits */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Gratuit</p>
        {OUTILS.filter(o => !o.premium).map(outil => (
          <div key={outil.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setOpen(open === outil.id ? null : outil.id)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left"
            >
              <span className="text-2xl">{outil.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{outil.titre}</p>
                <p className="text-xs text-gray-400 mt-0.5">{outil.desc}</p>
              </div>
              <span className="text-gray-300 text-lg shrink-0">
                {open === outil.id ? '↑' : '↓'}
              </span>
            </button>
            {open === outil.id && (
              <div className="px-4 pb-4 border-t border-gray-50">
                <div className="pt-4">{outil.component}</div>
              </div>
            )}
          </div>
        ))}

        {/* Premium */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mt-2">Premium 🔒</p>
        {OUTILS.filter(o => o.premium).map(outil => (
          <div key={outil.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setOpen(open === outil.id ? null : outil.id)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left"
            >
              <span className="text-2xl">{outil.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800 text-sm">{outil.titre}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#DBEAFE', color: '#92400E' }}>
                    Premium
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{outil.desc}</p>
              </div>
              <span className="text-gray-300 text-lg shrink-0">
                {open === outil.id ? '↑' : '↓'}
              </span>
            </button>
            {open === outil.id && (
              <div className="px-4 pb-4 border-t border-gray-50">
                <div className="pt-4">{outil.component}</div>
              </div>
            )}
          </div>
        ))}
      </main>

    </div>
  )
}
