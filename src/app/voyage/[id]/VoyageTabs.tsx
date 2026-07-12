'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { Info, CheckSquare, FolderLock, CreditCard, Map, Calendar, Siren, Ambulance as AmbulanceIcon, Landmark } from 'lucide-react'
import ChecklistSection from './ChecklistSection'
import VoyageDocuments from './VoyageDocuments'
import EntreAmisTab from './EntreAmisTab'
import ActivitesSection from './ActivitesSection'
import PlanningSection from './PlanningSection'
import type { Jour, Hebergement, Transport, ActivitePlanning, Repas, ActiviteFavorite, JourSpecial } from './PlanningJourSheet'
import type { DocumentVoyage } from './LienDocument'
import InfoCard from './InfoCard'
import SlideToggle from './SlideToggle'
import DeviseConverter from './DeviseConverter'
import { getArianeUrl } from '@/lib/utils/paysCode'
import { toggleInfoStatus } from './info-status-actions'
import { calculerAge } from '@/lib/utils/calculerAge'

// Interprète les **passages en gras** dans un texte issu de la fiche pays.
function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

const INFO_GRADIENTS = [
  'linear-gradient(135deg, #A78BFA, #7C3AED)',
  'linear-gradient(135deg, #38BDF8, #0284C7)',
  'linear-gradient(135deg, #2DD4BF, #0891B2)',
  'linear-gradient(135deg, #4ADE80, #15803D)',
  'linear-gradient(135deg, #FB923C, #C2410C)',
  'linear-gradient(135deg, #F472B6, #BE185D)',
  'linear-gradient(135deg, #818CF8, #4338CA)',
  'linear-gradient(135deg, #94A3B8, #475569)',
  'linear-gradient(135deg, #FACC15, #CA8A04)',
]

const DOC_TYPE_BY_INFO: Record<string, string> = {
  visa: 'visa',
  passeport: 'passeport',
  vaccins: 'carnet_vaccins',
  assurance: 'assurance',
}

// Catégories fixes, communes à toutes les destinations. Seules les cartes
// "importantes" ont un toggle (À faire/Fait ou À lire/Lu) ; les cartes
// "pratiques" n'en ont aucun et ne comptent pas dans la progression.
const IMPORTANT_IDS = ['securite', 'passeport', 'visa', 'vaccins', 'assurance', 'douane']

type Pays = Record<string, any>
type Activite = {
  id: string
  ville: string
  categorie: string
  titre: string
  horaires: string | null
  tarifs: string | null
  description: string | null
  notes: string | null
  photo_url: string | null
  ordre: number
}
type Doc = { id: string; type: string; nom_fichier: string; storage_path: string; date_expiration: string | null; voyage_id: string | null; membre: { prenom: string } | null }
type ChecklistItem = { id: string; valise_id: string; categorie: string; sous_categorie: string | null; label: string; description: string | null; quantite: string | null; obligatoire: boolean; completed: boolean }
type Valise = { id: string; membre: { id: string; prenom: string; type: string }; items: ChecklistItem[]; bagagesTypes: string[] }
type Membre = { id: string; prenom: string; type: 'adulte' | 'enfant'; avatarUrl?: string | null; emoji?: string | null; dateNaissance?: string | null }

export default function VoyageTabs({
  pays, documents, tousLesMembres, membresGeres, valises,
  voyageId, voyageNom, dateDepart, dateRetour, paysCode,
  depenses, budgetTotal, activites, wishlistActiviteIds, tauxLive, infoStatusParPersonne, jours,
  planningJours, planningHebergements, planningTransports, planningActivites, planningRepas, activitesFavorites,
  jourDepart, jourRetour, documentsVoyage,
  modeGestion, isOrganisateur, currentMembreId,
}: {
  pays: Pays | null
  documents: Doc[]
  tousLesMembres: Membre[]
  membresGeres: Membre[]
  valises: Valise[]
  voyageId: string
  voyageNom: string
  dateDepart: string
  dateRetour: string
  paysCode: string | null
  depenses: any[]
  budgetTotal: number
  activites: Activite[]
  wishlistActiviteIds: string[]
  tauxLive: number | null
  infoStatusParPersonne: Record<string, Record<string, boolean>>
  jours: number
  planningJours: Jour[]
  planningHebergements: Hebergement[]
  planningTransports: Transport[]
  planningActivites: ActivitePlanning[]
  planningRepas: Repas[]
  activitesFavorites: ActiviteFavorite[]
  jourDepart: JourSpecial
  jourRetour: JourSpecial
  documentsVoyage: DocumentVoyage[]
  modeGestion: 'solo' | 'organisateur' | 'partage'
  isOrganisateur: boolean
  currentMembreId: string
}) {
  const TABS = [
    { key: 'infos',      label: 'Infos',     icon: Info,        show: true },
    { key: 'checklist',  label: 'Checklist', icon: CheckSquare, show: true },
    { key: 'documents',  label: 'Documents', icon: FolderLock,  show: true },
    { key: 'activites',  label: 'Activités', icon: Map,         show: true },
    { key: 'planning',   label: 'Planning',  icon: Calendar,    show: true },
    { key: 'amis',       label: 'Budget',    icon: CreditCard,  show: true },
  ].filter(t => t.show)

  const [active, setActive] = useState('infos')
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null)
  const toggleInfo = (id: string) => setExpandedInfo(e => e === id ? null : id)
  const arianeUrl = getArianeUrl(paysCode)
  // Liens contextuels (visa, santé, douane...) rattachés à leur carte via un type.
  const lienParType = (type: string): { label: string; url: string } | undefined =>
    (pays?.liens_officiels as { label: string; url: string; type: string }[] | undefined)?.find(l => l.type === type)

  // Photos des cartes Infos : pour l'instant, seule la Thaïlande en a — case vide ailleurs.
  const photoInfo = (nom: string) => paysCode === 'TH' ? `/images/infos/${nom}.png` : undefined
  const photoInfoFait = (nom: string) => paysCode === 'TH' ? `/images/infos/${nom}-fait.png` : undefined

  useEffect(() => {
    if (!expandedInfo) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const clickedId = target.closest<HTMLElement>('[data-info-id]')?.dataset.infoId ?? null
      if (clickedId !== expandedInfo) setExpandedInfo(null)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [expandedInfo])

  const niveauStyle: Record<string, { label: string }> = {
    vert:   { label: 'Sûr' },
    orange: { label: 'Vigilance recommandée' },
    rouge:  { label: 'Déconseillé' },
  }
  const securite = pays?.niveau_securite ? niveauStyle[pays.niveau_securite] : null

  // État "géré" des cartes Info, par membre (clé = voyage_membres.id), avec mise à jour optimiste
  const [infoStatusLocal, setInfoStatusLocal] = useState(infoStatusParPersonne)
  const [, startInfoTransition] = useTransition()

  const setPersonInfoStatus = (membreId: string, infoId: string, next: boolean) => {
    setInfoStatusLocal(prev => ({ ...prev, [membreId]: { ...(prev[membreId] ?? {}), [infoId]: next } }))
    startInfoTransition(() => {
      toggleInfoStatus(voyageId, infoId, next, membreId)
    })
  }

  const handleToggleInfo = (infoId: string) => {
    const current = !!infoStatusLocal[currentMembreId]?.[infoId]
    setPersonInfoStatus(currentMembreId, infoId, !current)
  }

  // Les 10 catégories sont fixes et toujours affichées, même sans contenu
  // pour l'instant (fiche pays pas encore remplie).
  const infoCardIds = useMemo(() => (
    ['visa', 'passeport', 'vaccins', 'urgences', 'devise', 'prise', 'securite', 'reseau', 'douane', 'assurance']
  ), [])

  // Cartes dont la démarche n'est pas requise pour ce voyage (pas de visa/vaccin nécessaire) :
  // rien à cocher, elles comptent comme "faites" partout où on calcule une progression.
  const requisParId: Record<string, boolean> = {
    visa: !!pays?.visa_requis_france,
    vaccins: !!pays?.vaccins_obligatoires,
  }

  const [presetDocType, setPresetDocType] = useState<{ type: string; nonce: number } | null>(null)
  const handleAjouterDocument = (docType: string) => {
    setPresetDocType({ type: docType, nonce: Date.now() })
    setActive('documents')
  }

  // Seules les cartes "importantes" (Sécurité, Passeport, Visa, Santé, Assurance, Douane) ont
  // un toggle ; les cartes "pratiques" (Internet, Argent, Électricité, Urgences) n'en ont
  // aucun. Parmi les importantes : celles avec une vraie démarche individuelle et un document
  // associé (visa, passeport, vaccins, assurance), ET réellement requise pour ce voyage (ex :
  // un visa est effectivement demandé) : toggle "À FAIRE"/"FAIT", décliné par personne si
  // plusieurs membres gérés. Les autres importantes (Sécurité, Douane, ou démarche non requise
  // comme un visa qui n'est pas nécessaire) : un simple toggle global "À LIRE"/"LU".
  const infoCardProps = (id: string, requisIndividuellement: boolean = true) => {
    if (!IMPORTANT_IDS.includes(id)) {
      // Pas de toggle sur ces cartes : jamais "fait", toujours la photo couleur.
      return { completed: false }
    }
    const docType = DOC_TYPE_BY_INFO[id]
    if (!docType || !requisIndividuellement) {
      // Sécurité et Visa restent des démarches ("à faire"), même sans document
      // associé ou quand la démarche n'est pas requise pour ce voyage.
      const aFaire = id === 'securite' || id === 'visa'
      return {
        completed: !!infoStatusLocal[currentMembreId]?.[id],
        onToggleDone: handleToggleInfo,
        labelIdle: aFaire ? 'À FAIRE' : 'À LIRE',
        labelDone: aFaire ? 'FAIT' : 'LU',
        docType,
        onAjouterDocument: docType && isOrganisateur ? handleAjouterDocument : undefined,
      }
    }
    const labelIdle = id === 'passeport' ? 'À VALIDER' : undefined
    const labelDone = id === 'passeport' ? 'VALIDE' : undefined
    if (membresGeres.length <= 1) {
      return {
        completed: !!infoStatusLocal[currentMembreId]?.[id],
        onToggleDone: handleToggleInfo,
        docType,
        onAjouterDocument: isOrganisateur ? handleAjouterDocument : undefined,
        labelIdle,
        labelDone,
      }
    }
    const allDone = membresGeres.every(m => !!infoStatusLocal[m.id]?.[id])
    return {
      completed: allDone,
      docType,
      onAjouterDocument: isOrganisateur ? handleAjouterDocument : undefined,
      extraHeader: (
        <div className="flex flex-col gap-2 rounded-xl bg-gray-50 p-2.5">
          {membresGeres.map(m => {
            const personDone = !!infoStatusLocal[m.id]?.[id]
            return (
              <div key={m.id} className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-700 flex-1 min-w-0 truncate">
                  {m.type === 'enfant' ? '👶' : '🧑'} {m.prenom}
                  {m.type === 'enfant' && m.dateNaissance && (
                    <span className="text-gray-400 font-normal"> · {calculerAge(m.dateNaissance)} ans</span>
                  )}
                </span>
                <div className="shrink-0" style={{ width: 190 }}>
                  <SlideToggle
                    completed={personDone}
                    onToggle={() => setPersonInfoStatus(m.id, id, !personDone)}
                    color="#36A6B2"
                    handleWidth={40}
                    handleHeight={22}
                    fontSize={11}
                    labelIdle={labelIdle}
                    labelDone={labelDone}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ),
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white pt-4 pb-2 sticky top-0 z-30">
        <div className="flex items-center justify-between gap-1 px-3 py-2.5"
          style={{ borderRadius: 9999, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #F0F0F0' }}>
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = active === tab.key
            return (
              <button key={tab.key} onClick={() => setActive(tab.key)}
                className="flex items-center justify-center gap-1.5 transition-all overflow-hidden"
                style={{
                  borderRadius: 9999,
                  padding: isActive ? '8px 14px' : '8px',
                  background: isActive ? 'rgba(54,166,178,0.12)' : 'transparent',
                  boxShadow: isActive ? '0 0 6px 1px rgba(54,166,178,0.3)' : 'none',
                }}>
                <Icon size={18} color={isActive ? '#36A6B2' : '#9CA3AF'} className="shrink-0" />
                {isActive && (
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', color: '#36A6B2', whiteSpace: 'nowrap' }}>
                    {tab.label.toUpperCase()}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── INFOS ─── */}
      {active === 'infos' && pays && (
        <div className="flex flex-col gap-1.5">
          {infoCardIds.length > 0 && (() => {
            const selfStatus = infoStatusLocal[currentMembreId] ?? {}

            // Seules les cartes "importantes" ont un toggle : la progression ne se
            // calcule que sur elles (les "pratiques" n'ont rien à cocher).
            const importantIds = infoCardIds.filter(id => IMPORTANT_IDS.includes(id))
            const doneImportants = importantIds.filter(id => selfStatus[id]).length
            const pct = importantIds.length > 0 ? Math.round((doneImportants / importantIds.length) * 100) : 100

            return (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-100">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#004850' }} />
                </div>
                <span className="text-xs font-bold text-gray-700 shrink-0">{pct}%</span>
              </div>
            )
          })()}

          <p style={{ fontSize: 12, fontWeight: 700, color: '#004850', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 2px 4px' }}>
            Important
          </p>

          <div className="grid grid-cols-2 gap-2">
          {securite && (
            <InfoCard
              id="securite"
              title={`${pays.niveau_securite === 'vert' ? '🟢' : pays.niveau_securite === 'orange' ? '🟠' : '🔴'} Sécurité`}
              gradient={INFO_GRADIENTS[0]}
              photo="/images/infos/securite-page-vierge.png"
              photoFait="/images/infos/securite-page-fait.png"
              expandedId={expandedInfo}
              onToggle={toggleInfo}
              useModal
              {...infoCardProps('securite')}>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Niveau de vigilance</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pays.infos_securite ?? 'Informations à venir.'}</p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Zones à éviter</p>
                  {Array.isArray(pays.zones_deconseillees) && pays.zones_deconseillees.length > 0 ? (
                    (pays.zones_deconseillees as { zone: string; niveau: string; note: string }[]).map((z, i) => (
                      <p key={i} className="text-xs text-gray-500 leading-relaxed">{z.note}</p>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 leading-relaxed">Informations à venir.</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Conseils important</p>
                  {Array.isArray(pays.conseils_securite) && pays.conseils_securite.length > 0 ? (
                    <ul className="flex flex-col gap-1">
                      {(pays.conseils_securite as string[]).map((conseil, i) => (
                        <li key={i} className="text-xs text-gray-500 leading-relaxed flex gap-1.5">
                          <span className="text-gray-400">•</span><span>{conseil}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500 leading-relaxed">Informations à venir.</p>
                  )}
                </div>

                <p className="text-xs italic leading-relaxed rounded-xl px-3 py-2.5 text-gray-500" style={{ background: '#F0FAFA' }}>
                  Ariane est le service d&apos;inscription du Ministère de l&apos;Europe et des Affaires étrangères. En cas de crise, l&apos;ambassade peut vous contacter. Inscription gratuite et vivement conseillée.
                </p>
                <a href={arianeUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between text-xs font-semibold text-white rounded-xl px-3 py-2" style={{ background: '#004850' }}>
                  <span>Consulter & s&apos;inscrire sur Ariane</span>
                  <span className="opacity-60">↗</span>
                </a>
              </div>
            </InfoCard>
          )}

          <InfoCard id="visa" title="🛂 Visa" gradient={INFO_GRADIENTS[1]} photo={photoInfo('visa')} photoFait={photoInfoFait('visa')} expandedId={expandedInfo} onToggle={toggleInfo} useModal {...infoCardProps('visa', requisParId.visa)}>
            <div className="flex flex-col gap-3">
              <div className="rounded-xl px-3 py-2.5" style={{ background: '#FDECEC' }}>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Démarche obligatoire</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {pays.entree_details?.formulaire_arrivee?.nom
                    ? <>{pays.entree_details.formulaire_arrivee.nom}{pays.entree_details.formulaire_arrivee.delai && ` ${pays.entree_details.formulaire_arrivee.delai}.`}</>
                    : 'Informations à venir.'}
                </p>
              </div>
              {pays.entree_details?.formulaire_arrivee?.lien && (
                <a href={pays.entree_details.formulaire_arrivee.lien} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between text-xs font-semibold text-white rounded-xl px-3 py-2" style={{ background: '#004850' }}>
                  <span>{pays.entree_details.formulaire_arrivee.lien_label ?? `Obtenir la ${pays.entree_details.formulaire_arrivee.nom}`}</span>
                  <span className="opacity-60">↗</span>
                </a>
              )}

              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Visa</p>
                <p className="text-xs text-gray-500 leading-relaxed">{pays.visa_details ?? 'Informations à venir.'}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Visa si séjour {'>'} 60 jours</p>
                <p className="text-xs text-gray-500 leading-relaxed">{pays.entree_details?.prolongation ?? 'Informations à venir.'}</p>
              </div>
              {lienParType('visa') && (
                <a href={lienParType('visa')!.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between text-xs font-semibold text-white rounded-xl px-3 py-2" style={{ background: '#004850' }}>
                  <span>{lienParType('visa')!.label}</span>
                  <span className="opacity-60">↗</span>
                </a>
              )}
            </div>
          </InfoCard>

          <InfoCard id="passeport" title="📔 Passeport" gradient={INFO_GRADIENTS[6]} photo={photoInfo('passeport')} photoFait={photoInfoFait('passeport')} expandedId={expandedInfo} onToggle={toggleInfo} useModal {...infoCardProps('passeport')}>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Conditions de validité</p>
                {Array.isArray(pays.entree_details?.passeport_conditions) && pays.entree_details.passeport_conditions.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {(pays.entree_details.passeport_conditions as string[]).map((paragraphe, i) => (
                      <p key={i} className="text-xs text-gray-500 leading-relaxed">{paragraphe}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 leading-relaxed">Informations à venir.</p>
                )}
              </div>
            </div>
          </InfoCard>

          <InfoCard id="vaccins" title="💉 Santé" gradient={INFO_GRADIENTS[2]} photo={photoInfo('sante')} photoFait={photoInfoFait('sante')} expandedId={expandedInfo} onToggle={toggleInfo} useModal {...infoCardProps('vaccins', requisParId.vaccins)}>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Vaccins obligatoire</p>
                {Array.isArray(pays.sante_details?.vaccins_obligatoire) && pays.sante_details.vaccins_obligatoire.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {(pays.sante_details.vaccins_obligatoire as string[]).map((paragraphe, i) => (
                      <p key={i} className="text-xs text-gray-500 leading-relaxed">{renderBold(paragraphe)}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 leading-relaxed">Informations à venir.</p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Vaccins recommandé</p>
                <p className="text-xs text-gray-500 leading-relaxed">{pays.vaccins_recommandes ? renderBold(pays.vaccins_recommandes) : 'Informations à venir.'}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>À savoir</p>
                {Array.isArray(pays.sante_details?.a_savoir) && pays.sante_details.a_savoir.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {(pays.sante_details.a_savoir as string[]).map((point, i) => (
                      <li key={i} className="text-xs text-gray-500 leading-relaxed flex gap-1.5">
                        <span className="text-gray-400">•</span><span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 leading-relaxed">Informations à venir.</p>
                )}
              </div>

              <p className="text-xs italic leading-relaxed rounded-xl px-3 py-2.5 text-gray-500" style={{ background: '#F0FAFA' }}>
                Les recommandations peuvent évoluer. Consultez le site de l&apos;Institut Pasteur, idéalement 4 à 6 semaines avant votre départ.
              </p>
              <button disabled
                className="w-full flex items-center justify-between text-xs font-semibold text-white rounded-xl px-3 py-2 cursor-not-allowed"
                style={{ background: '#004850' }}>
                <span>Consulter les conseils de l&apos;Institut Pasteur</span>
                <span className="opacity-60">↗</span>
              </button>

              <button disabled
                className="w-full flex items-center justify-center text-xs font-semibold rounded-xl px-3 py-2 border opacity-50 cursor-not-allowed"
                style={{ background: '#E8F5E9', color: '#2E7D32', borderColor: '#2E7D3233' }}>
                Générer ma trousse de secours
              </button>
            </div>
          </InfoCard>

          <InfoCard id="assurance" title="🏥 Assurance" gradient={INFO_GRADIENTS[2]} photo={photoInfo('assurance')} photoFait={photoInfoFait('assurance')} expandedId={expandedInfo} onToggle={toggleInfo} useModal {...infoCardProps('assurance')}>
            <div className="flex flex-col gap-3">
              {Array.isArray(pays.assurance_info) && pays.assurance_info.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {(pays.assurance_info as string[]).map((paragraphe, i) => (
                    <p key={i} className="text-xs text-gray-500 leading-relaxed">{renderBold(paragraphe)}</p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 leading-relaxed">Informations à venir.</p>
              )}
              <button disabled
                className="w-full flex items-center justify-between text-xs font-semibold text-white rounded-xl px-3 py-2 cursor-not-allowed"
                style={{ background: '#004850' }}>
                <span>Souscrire à une assurance</span>
                <span className="opacity-60">↗</span>
              </button>
            </div>
          </InfoCard>

          <InfoCard id="douane" title="🧳 Douane" gradient={INFO_GRADIENTS[0]} photo={photoInfo('douane')} photoFait={photoInfoFait('douane')} expandedId={expandedInfo} onToggle={toggleInfo} useModal {...infoCardProps('douane')}>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>À l&apos;aller</p>
                {Array.isArray(pays.douane_details?.a_laller) && pays.douane_details.a_laller.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {(pays.douane_details.a_laller as string[]).map((point, i) => (
                      <li key={i} className="text-xs text-gray-500 leading-relaxed flex gap-1.5">
                        <span className="text-gray-400">•</span><span>{renderBold(point)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 leading-relaxed">Informations à venir.</p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Au retour</p>
                {Array.isArray(pays.douane_details?.au_retour) && pays.douane_details.au_retour.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {(pays.douane_details.au_retour as string[]).map((point, i) => (
                      <li key={i} className="text-xs text-gray-500 leading-relaxed flex gap-1.5">
                        <span className="text-gray-400">•</span><span>{renderBold(point)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 leading-relaxed">Informations à venir.</p>
                )}
              </div>

              {lienParType('douane') && (
                <a href={lienParType('douane')!.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between text-xs font-semibold text-white rounded-xl px-3 py-2" style={{ background: '#004850' }}>
                  <span>{lienParType('douane')!.label}</span>
                  <span className="opacity-60">↗</span>
                </a>
              )}
            </div>
          </InfoCard>
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: '#004850', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '10px 0 2px 4px' }}>
            Pratique
          </p>

          <div className="grid grid-cols-2 gap-2">
          <InfoCard id="urgences" title="🆘 Numéros d'urgence" gradient={INFO_GRADIENTS[4]} photo={photoInfo('urgences')} photoFait={photoInfoFait('urgences')} expandedId={expandedInfo} onToggle={toggleInfo} useModal {...infoCardProps('urgences')}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Police', number: pays.urgence_police, Icon: Siren },
                  { label: 'Ambulance', number: pays.urgence_ambulance, Icon: AmbulanceIcon },
                  { label: 'Ambassade', number: pays.urgence_ambassade_france, Icon: Landmark },
                ].map(u => (
                  <div key={u.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <u.Icon size={20} color="#9CA3AF" className="shrink-0" />
                    <span className="text-xs text-gray-400 flex-1">{u.label}</span>
                    <span className="text-sm font-bold text-gray-800">{u.number ?? '–'}</span>
                  </div>
                ))}
              </div>
              {Array.isArray(pays.urgence_autres) && pays.urgence_autres.length > 0 && (
                <div className="flex flex-col">
                  {(pays.urgence_autres as { label: string; numero: string }[]).map((u, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-500">{u.label}</span>
                      <span className="text-sm font-semibold text-gray-800">{u.numero}</span>
                    </div>
                  ))}
                </div>
              )}
              {pays.ambassade_info?.adresse && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Ambassade de France</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pays.ambassade_info.adresse}</p>
                  {pays.ambassade_info.tel_urgence && <p className="text-xs text-gray-500 leading-relaxed mt-1">Urgence consulaire : {pays.ambassade_info.tel_urgence}</p>}
                </div>
              )}
            </div>
          </InfoCard>

          <InfoCard id="devise" title="💰 Argent" gradient={INFO_GRADIENTS[5]} photo={photoInfo('argent')} photoFait={photoInfoFait('argent')} expandedId={expandedInfo} onToggle={toggleInfo} useModal {...infoCardProps('devise')}>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Devise</p>
                <p className="text-xs text-gray-500 leading-relaxed">{pays.devise ?? 'Informations à venir.'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Paiement</p>
                <p className="text-xs text-gray-500 leading-relaxed">{pays.argent_notes ?? 'Informations à venir.'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>💱 Convertisseur : EUR ⇄ {pays.devise_code ?? ''}</p>
                <DeviseConverter devise={null} symbole={pays.symbole_devise ?? null} tauxLive={tauxLive} tauxApprox={pays.taux_change_approx ?? null} showLabel={false} />
              </div>
            </div>
          </InfoCard>

          <InfoCard id="prise" title="🔌 Électricité" gradient={INFO_GRADIENTS[6]} photo={photoInfo('electricite')} photoFait={photoInfoFait('electricite')} expandedId={expandedInfo} onToggle={toggleInfo} useModal {...infoCardProps('prise')}>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Voltage</p>
                <p className="text-xs text-gray-500 leading-relaxed">{pays.electricite_details?.voltage ?? 'Informations à venir.'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Prise</p>
                <p className="text-xs text-gray-500 leading-relaxed">{pays.electricite_details?.types_prise ?? 'Informations à venir.'}</p>
                {pays.electricite_details?.adaptateur && (
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">{renderBold(pays.electricite_details.adaptateur)}</p>
                )}
              </div>
            </div>
          </InfoCard>

          <InfoCard id="reseau" title="📶 Internet" gradient={INFO_GRADIENTS[7]} photo={photoInfo('internet')} photoFait={photoInfoFait('internet')} expandedId={expandedInfo} onToggle={toggleInfo} useModal {...infoCardProps('reseau')}>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Avant le départ</p>
                <p className="text-xs text-gray-500 leading-relaxed">{pays.reseau_details?.avant_depart ? renderBold(pays.reseau_details.avant_depart) : 'Informations à venir.'}</p>
              </div>
              {['eSIM Airalo', 'eSIM Holafly', 'eSIM Nomad'].map(label => (
                <button key={label} disabled
                  className="w-full flex items-center justify-between text-xs font-semibold text-white rounded-xl px-3 py-2 cursor-not-allowed"
                  style={{ background: '#004850' }}>
                  <span>{label}</span>
                  <span className="opacity-60">↗</span>
                </button>
              ))}
              <div>
                <p className="text-xs font-bold uppercase text-[#004850] mb-0.5" style={{ letterSpacing: '-0.02em' }}>Sur place</p>
                <p className="text-xs text-gray-500 leading-relaxed">{pays.reseau_details?.sur_place ? renderBold(pays.reseau_details.sur_place) : 'Informations à venir.'}</p>
              </div>
            </div>
          </InfoCard>

          </div>
        </div>
      )}

      {/* ─── ACTIVITÉS ─── */}
      {active === 'activites' && (
        <ActivitesSection activites={activites} wishlistIds={wishlistActiviteIds} voyageId={voyageId} jours={planningJours} />
      )}

      {/* ─── PLANNING ─── */}
      {active === 'planning' && (
        <PlanningSection
          voyageId={voyageId}
          voyageNom={voyageNom}
          jours={planningJours}
          hebergements={planningHebergements}
          transports={planningTransports}
          activites={planningActivites}
          repas={planningRepas}
          activitesFavorites={activitesFavorites}
          jourDepart={jourDepart}
          jourRetour={jourRetour}
          documentsVoyage={documentsVoyage}
        />
      )}

      {/* ─── CHECKLIST + VALISE (fusionnées, toujours perso sauf override organisateur) ─── */}
      {active === 'checklist' && (
        <div className="flex flex-col gap-4">
          {!isOrganisateur && modeGestion === 'partage' && (
            <p className="text-xs text-gray-500 leading-relaxed">Ta checklist et ta valise personnelles pour ce voyage partagé.</p>
          )}
          <ChecklistSection
            valises={valises}
            voyageId={voyageId}
            voyageNom={voyageNom}
            dateDepart={dateDepart}
            dateRetour={dateRetour}
            paysCode={paysCode}
            jours={jours}
            onGoToPratique={() => setActive('infos')}
          />
        </div>
      )}

      {/* ─── DOCUMENTS ─── */}
      {active === 'documents' && (
        <VoyageDocuments documents={documents} membres={tousLesMembres} voyageId={voyageId} presetType={presetDocType} />
      )}

      {/* ─── BUDGET ─── */}
      {active === 'amis' && (
        <EntreAmisTab
          voyageId={voyageId}
          membres={tousLesMembres.filter(m => m.type === 'adulte')}
          depensesInitiales={depenses}
          budgetTotal={budgetTotal}
        />
      )}
    </div>
  )
}
