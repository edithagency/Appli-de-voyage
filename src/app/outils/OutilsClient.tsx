'use client'

import { useEffect, useState, useTransition } from 'react'
import { Poppins } from 'next/font/google'
import { X, Star } from 'lucide-react'
import DeviseGenerique from './DeviseGenerique'
import TailleConverter from './TailleConverter'
import DecalageHoraire from './DecalageHoraire'
import ReglesBagages from './ReglesBagages'
import ComparateurCartes from './ComparateurCartes'
import TrousseMedicale from './TrousseMedicale'
import PhrasesEssentielles from './PhrasesEssentielles'
import NumerosUrgence, { type PaysOutil } from './NumerosUrgence'
import EtSiPartaisDemain from './EtSiPartaisDemain'
import PermisGuide from './PermisGuide'
import MedicamentsTraducteur from './MedicamentsTraducteur'
import { toggleFavoriOutil } from './favoris-actions'

const FAVORIS_STORAGE_KEY = 'bonvol_outils_favoris'

const poppins = Poppins({ subsets: ['latin'], weight: ['700'] })

const GRADIENTS = [
  'linear-gradient(135deg, #36A6B2, #1D7480)',
  'linear-gradient(135deg, #8B7FD9, #534AB7)',
  'linear-gradient(135deg, #34C28E, #0F6B4F)',
  'linear-gradient(135deg, #F0998A, #C2410C)',
  'linear-gradient(135deg, #5BAEEF, #1D4ED8)',
  'linear-gradient(135deg, #E08AD0, #A21CAF)',
]

const OUTILS = [
  {
    id: 'devises',
    emoji: '💱',
    titre: 'Convertisseur de devises',
    description: 'Convertit instantanément entre 28 devises mondiales',
    premium: false,
  },
  {
    id: 'tailles',
    emoji: '👕',
    titre: 'Convertisseur de tailles',
    description: 'Chaussures et vêtements EU / UK / US / IT',
    premium: false,
  },
  {
    id: 'horaire',
    emoji: '🕐',
    titre: 'Décalage horaire',
    description: 'Heure locale en temps réel dans 30 villes',
    premium: false,
  },
  {
    id: 'bagages',
    emoji: '🧳',
    titre: 'Règles bagages',
    description: 'Dimensions et poids par compagnie aérienne',
    premium: false,
  },
  {
    id: 'cartes',
    emoji: '💳',
    titre: 'Comparateur cartes bancaires',
    description: "Frais à l'étranger · Revolut, Wise, N26...",
    premium: false,
  },
  {
    id: 'medical',
    emoji: '💊',
    titre: 'Trousse médicale',
    description: 'Liste médicaments par destination et profil',
    premium: false,
  },
  {
    id: 'phrases',
    emoji: '🗣️',
    titre: 'Phrases essentielles',
    description: '20 phrases vitales dans la langue locale',
    premium: false,
  },
  {
    id: 'urgences',
    emoji: '🚨',
    titre: "Numéros d'urgence",
    description: 'Police · Ambulance · Ambassade par pays',
    premium: false,
  },
  {
    id: 'demain',
    emoji: '⚡',
    titre: 'Et si je partais demain ?',
    description: 'Vérifier ma préparation instantanément',
    premium: false,
  },
  {
    id: 'permis',
    emoji: '🚗',
    titre: 'Guide permis international',
    description: "Validité du permis FR par pays + comment obtenir un permis international",
    premium: true,
  },
  {
    id: 'medicaments',
    emoji: '💉',
    titre: 'Traducteur de médicaments',
    description: 'Nom générique + équivalents locaux par pays',
    premium: true,
  },
].map((o, i) => ({ ...o, gradient: GRADIENTS[i % GRADIENTS.length] }))

export default function OutilsClient({
  pays, defaultPaysCode, autoOpenTool, isLoggedIn, favorisInitiaux,
}: {
  pays: PaysOutil[]
  defaultPaysCode: string | null
  autoOpenTool: string | null
  isLoggedIn: boolean
  favorisInitiaux: string[]
}) {
  const [openTool, setOpenTool] = useState<string | null>(null)
  // Ordre = ordre d'ajout, le plus récent en premier (favorisInitiaux vient déjà
  // trié ainsi côté serveur via created_at desc).
  const [favoris, setFavoris] = useState<string[]>(favorisInitiaux)
  const [, startTransition] = useTransition()

  // Deep-link depuis une page voyage (?pays=XX&open=urgences) : ouvre l'outil directement.
  useEffect(() => {
    if (autoOpenTool) setOpenTool(autoOpenTool)
  }, [autoOpenTool])

  // Visiteur non connecté : les favoris ne viennent pas du serveur, on les
  // relit depuis le localStorage (pas de synchronisation entre appareils).
  useEffect(() => {
    if (isLoggedIn) return
    const stored = localStorage.getItem(FAVORIS_STORAGE_KEY)
    if (stored) {
      try { setFavoris(JSON.parse(stored)) } catch { /* ignore une valeur corrompue */ }
    }
  }, [isLoggedIn])

  function toggleFavori(id: string) {
    setFavoris(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [id, ...prev]
      if (!isLoggedIn) localStorage.setItem(FAVORIS_STORAGE_KEY, JSON.stringify(next))
      return next
    })
    if (isLoggedIn) startTransition(() => { toggleFavoriOutil(id) })
  }

  const favorisOutils = favoris.map(id => OUTILS.find(o => o.id === id)).filter((o): o is typeof OUTILS[number] => !!o)
  const nonFavorisOutils = OUTILS.filter(o => !favoris.includes(o.id))

  function renderCard(outil: typeof OUTILS[number]) {
    const isFavori = favoris.includes(outil.id)
    return (
      <div key={outil.id}
        onClick={() => setOpenTool(outil.id)}
        style={{
          position: 'relative',
          aspectRatio: '0.85',
          borderRadius: 24,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: outil.gradient,
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          overflow: 'hidden',
        }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          {outil.emoji}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavori(outil.id)
          }}
          style={{
            position: 'absolute', top: 10, right: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            transition: 'fill 0.2s ease, color 0.2s ease',
          }}
        >
          <Star
            size={20}
            fill={isFavori ? '#FFFDD8' : 'none'}
            color={isFavori ? '#FFFDD8' : '#D1D5DB'}
            strokeWidth={1.5}
          />
        </button>

        {outil.premium && (
          <span style={{
            position: 'absolute', top: 42, right: 12,
            background: 'rgba(255,255,255,0.22)',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 9999,
            whiteSpace: 'nowrap',
          }}>Premium</span>
        )}

        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: 'white', margin: 0, lineHeight: 1.25 }}>
            {outil.titre}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '3px 0 0' }}>
            {outil.description}
          </p>
        </div>
      </div>
    )
  }

  // Favoris d'abord (du plus récemment ajouté au plus ancien), puis le reste dans
  // l'ordre habituel — une seule grille continue, même forme de carte partout.
  const outilsTries = [...favorisOutils, ...nonFavorisOutils]

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF', paddingBottom: 100 }}>
      <header className="bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto pt-5 sm:pt-11 pb-5 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="h-7" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-4 pb-6">
        <p className={`font-bold uppercase ${poppins.className}`} style={{ color: '#004850', fontSize: 30, letterSpacing: '-0.03em', margin: '0 0 12px' }}>Mes outils</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {outilsTries.map(renderCard)}
        </div>
      </main>

      {/* Modale centrée */}
      {openTool && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setOpenTool(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[85vh] overflow-y-auto relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setOpenTool(null)} style={{
              position: 'absolute', top: 16, right: 16,
              background: '#F3F4F6', borderRadius: '50%',
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}>
              <X size={16} color="#6B7280" />
            </button>

            {openTool === 'devises' && <DeviseGenerique />}
            {openTool === 'tailles' && <TailleConverter />}
            {openTool === 'horaire' && <DecalageHoraire />}
            {openTool === 'bagages' && <ReglesBagages />}
            {openTool === 'cartes' && <ComparateurCartes />}
            {openTool === 'medical' && <TrousseMedicale pays={pays} defaultPaysCode={defaultPaysCode} />}
            {openTool === 'phrases' && <PhrasesEssentielles pays={pays} defaultPaysCode={defaultPaysCode} />}
            {openTool === 'urgences' && <NumerosUrgence pays={pays} defaultPaysCode={defaultPaysCode} />}
            {openTool === 'demain' && <EtSiPartaisDemain />}
            {openTool === 'permis' && <PermisGuide />}
            {openTool === 'medicaments' && <MedicamentsTraducteur />}
          </div>
        </div>
      )}
    </div>
  )
}
