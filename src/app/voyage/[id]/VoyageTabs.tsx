'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { Info, CheckSquare, FolderLock, CreditCard, Map } from 'lucide-react'
import ChecklistSection from './ChecklistSection'
import VoyageDocuments from './VoyageDocuments'
import BagagesSection from './BagagesSection'
import EntreAmisTab from './EntreAmisTab'
import ActivitesSection from './ActivitesSection'
import InfoCard from './InfoCard'
import DeviseConverter from './DeviseConverter'
import { getArianeUrl } from '@/lib/utils/paysCode'
import { toggleInfoStatus } from './info-status-actions'

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
  vaccins: 'carnet_vaccins',
  assurance: 'assurance',
  transport: 'billet_avion',
}

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
type Membre = { id: string; prenom: string; type: 'adulte' | 'enfant' }

export default function VoyageTabs({
  pays, documents, tousLesMembres, membresGeres, valises,
  voyageId, voyageNom, dateDepart, dateRetour, compagnie, paysCode,
  depenses, budgetTotal, activites, wishlistActiviteIds, tauxLive, infoStatusParPersonne, jours,
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
  compagnie: string | null
  paysCode: string | null
  depenses: any[]
  budgetTotal: number
  activites: Activite[]
  wishlistActiviteIds: string[]
  tauxLive: number | null
  infoStatusParPersonne: Record<string, Record<string, boolean>>
  jours: number
  modeGestion: 'solo' | 'organisateur' | 'partage'
  isOrganisateur: boolean
  currentMembreId: string
}) {
  const TABS = [
    { key: 'infos',      label: 'Infos',     icon: Info,        show: true },
    { key: 'checklist',  label: 'Checklist', icon: CheckSquare, show: true },
    { key: 'documents',  label: 'Documents', icon: FolderLock,  show: true },
    { key: 'activites',  label: 'Activités', icon: Map,         show: activites.length > 0 },
    { key: 'amis',       label: 'Budget',    icon: CreditCard,  show: true },
  ].filter(t => t.show)

  const [active, setActive] = useState('infos')
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null)
  const toggleInfo = (id: string) => setExpandedInfo(e => e === id ? null : id)
  const arianeUrl = getArianeUrl(paysCode)

  useEffect(() => {
    if (!expandedInfo) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const clickedId = target.closest<HTMLElement>('[data-info-id]')?.dataset.infoId ?? null
      if (clickedId !== expandedInfo) setExpandedInfo(null)
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [expandedInfo])

  const niveauStyle: Record<string, { bg: string; text: string; label: string }> = {
    vert:   { bg: 'bg-green-50 border-green-200',  text: 'text-green-700',  label: 'Sûr' },
    orange: { bg: 'bg-amber-50 border-amber-200',  text: 'text-amber-700',  label: 'Vigilance recommandée' },
    rouge:  { bg: 'bg-red-50 border-red-200',      text: 'text-red-700',    label: 'Déconseillé' },
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

  const infoCardIds = useMemo(() => {
    const ids = ['visa', 'vaccins', 'urgences', 'devise', 'prise', 'bagages']
    if (securite) ids.push('securite')
    if (Array.isArray(pays?.zones_deconseillees) && pays.zones_deconseillees.length > 0) ids.push('zones')
    if (pays?.reseau_mobile_info) ids.push('reseau')
    if (pays?.douane_infos) ids.push('douane')
    if (pays?.transport_info) ids.push('transport')
    if (pays?.assurance_info) ids.push('assurance')
    if (Array.isArray(pays?.sante_details?.trousse_medicale) && pays.sante_details.trousse_medicale.length > 0) ids.push('trousse')
    if (Array.isArray(pays?.phrases_essentielles) && pays.phrases_essentielles.length > 0) ids.push('phrases')
    if (Array.isArray(pays?.liens_officiels) && pays.liens_officiels.length > 0) ids.push('liens')
    return ids
  }, [pays, securite])

  const [presetDocType, setPresetDocType] = useState<{ type: string; nonce: number } | null>(null)
  const handleAjouterDocument = (docType: string) => {
    setPresetDocType({ type: docType, nonce: Date.now() })
    setActive('documents')
  }

  // Mono-personne (solo / partagé) : un seul toggle. Multi-personnes (organisateur, plusieurs membres
  // gérés) : une case par personne dans extraHeader ; le rond "géré" en haut reflète "tout le monde a fini".
  const infoCardProps = (id: string) => {
    if (membresGeres.length <= 1) {
      return {
        completed: !!infoStatusLocal[currentMembreId]?.[id],
        onToggleDone: handleToggleInfo,
        docType: DOC_TYPE_BY_INFO[id],
        onAjouterDocument: isOrganisateur ? handleAjouterDocument : undefined,
      }
    }
    const allDone = membresGeres.every(m => !!infoStatusLocal[m.id]?.[id])
    return {
      completed: allDone,
      docType: DOC_TYPE_BY_INFO[id],
      onAjouterDocument: isOrganisateur ? handleAjouterDocument : undefined,
      extraHeader: (
        <div className="flex flex-col gap-1.5 rounded-xl bg-gray-50 p-2.5">
          {membresGeres.map(m => {
            const personDone = !!infoStatusLocal[m.id]?.[id]
            return (
              <button key={m.id} onClick={() => setPersonInfoStatus(m.id, id, !personDone)}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition"
                style={{ background: personDone ? '#D1FAE5' : 'white' }}>
                <span className="text-xs font-medium text-gray-700">{m.type === 'enfant' ? '👶' : '🧑'} {m.prenom}</span>
                <span className="text-xs font-semibold" style={{ color: personDone ? '#065F46' : '#9CA3AF' }}>
                  {personDone ? '✓ Fait' : 'À faire'}
                </span>
              </button>
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
        <div className="flex flex-col gap-3">
          {infoCardIds.length > 0 && (() => {
            const selfStatus = infoStatusLocal[currentMembreId] ?? {}
            const total = infoCardIds.length
            const done = infoCardIds.filter(cid => selfStatus[cid]).length
            const pct = Math.round((done / total) * 100)
            return (
              <div className="rounded-2xl px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">✅ Préparation</span>
                  <span className="text-sm font-bold text-white">{done}/{total}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.25)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'white' }} />
                </div>
              </div>
            )
          })()}

          <h2 className="font-bold text-gray-800 text-xs px-1 uppercase tracking-wider">Important</h2>

          <div className="grid grid-cols-3 gap-3">
          {securite && (
            <InfoCard
              id="securite"
              title={`${pays.niveau_securite === 'vert' ? '🟢' : pays.niveau_securite === 'orange' ? '🟠' : '🔴'} Sécurité — ${securite.label}`}
              gradient={INFO_GRADIENTS[0]}
              expandedId={expandedInfo}
              onToggle={toggleInfo}
              {...infoCardProps('securite')}>
              <div className="flex flex-col gap-3">
                <div className={`rounded-xl px-3 py-2.5 border ${securite.bg}`}>
                  <p className={`text-xs font-semibold ${securite.text} mb-1`}>
                    {pays.niveau_securite === 'vert' && 'Vigilance normale'}
                    {pays.niveau_securite === 'orange' && 'Vigilance renforcée'}
                    {pays.niveau_securite === 'rouge' && 'Déconseillé sauf raison impérative'}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {pays.niveau_securite === 'vert' && 'La destination est considérée comme sûre. Adoptez les précautions habituelles en voyage.'}
                    {pays.niveau_securite === 'orange' && "Des risques existent dans certaines zones. Restez informé de l'actualité locale et évitez les zones à risque."}
                    {pays.niveau_securite === 'rouge' && 'Le gouvernement français déconseille fortement ce voyage. Consultez impérativement les conseils aux voyageurs avant tout départ.'}
                  </p>
                  {pays.infos_securite && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{pays.infos_securite}</p>}
                </div>
                <a href={arianeUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl border bg-blue-50 border-blue-100 text-xs font-medium text-blue-700">
                  <span>📋 Consulter les conseils & s&apos;inscrire sur Ariane</span>
                  <span className="opacity-60">↗</span>
                </a>
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-700">Ariane</span> est le service d&apos;inscription du Ministère de l&apos;Europe et des Affaires étrangères. En cas de crise, l&apos;ambassade peut vous contacter. <span className="font-medium">Inscription gratuite et vivement conseillée.</span>
                  </p>
                </div>
              </div>
            </InfoCard>
          )}

          <InfoCard id="visa" title="🛂 Visa & Entrée" gradient={INFO_GRADIENTS[1]} photo="/images/infos/visa.jpg" expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('visa')}>
            <div className="flex flex-col gap-2.5">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">{pays.visa_requis_france ? '⚠️ Visa requis' : '✅ Visa pas requis'}</p>
                {pays.visa_details && <p className="text-xs text-gray-500 leading-relaxed">{pays.visa_details}</p>}
              </div>
              {pays.entree_details?.formulaire_arrivee?.obligatoire && (
                <div className="rounded-xl px-3 py-2.5 border bg-amber-50 border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ {pays.entree_details.formulaire_arrivee.nom} obligatoire</p>
                  {pays.entree_details.formulaire_arrivee.delai && <p className="text-xs text-amber-700 leading-relaxed">{pays.entree_details.formulaire_arrivee.delai}</p>}
                  {pays.entree_details.formulaire_arrivee.note && <p className="text-xs text-gray-600 leading-relaxed mt-1">{pays.entree_details.formulaire_arrivee.note}</p>}
                </div>
              )}
              {pays.entree_details?.validite_passeport && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">📔 Passeport</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pays.entree_details.validite_passeport}</p>
                </div>
              )}
              {pays.entree_details?.billet_retour && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">🎫 Billet retour</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pays.entree_details.billet_retour}</p>
                </div>
              )}
              {pays.entree_details?.preuve_fonds && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">💵 Preuve de fonds</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pays.entree_details.preuve_fonds}</p>
                </div>
              )}
              {pays.entree_details?.prolongation && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">⏳ Prolongation de séjour</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pays.entree_details.prolongation}</p>
                </div>
              )}
            </div>
          </InfoCard>

          <InfoCard id="vaccins" title="💉 Vaccins" gradient={INFO_GRADIENTS[2]} photo="/images/infos/vaccins.jpg" expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('vaccins')}>
            <div className="flex flex-col gap-2.5">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">{pays.vaccins_obligatoires ? '⚠️ Obligatoires' : 'Aucun obligatoire'}</p>
                {pays.vaccins_recommandes && <p className="text-xs text-gray-500 leading-relaxed">{pays.vaccins_recommandes}</p>}
              </div>
              {pays.sante_details?.paludisme && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">🦟 Paludisme</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pays.sante_details.paludisme}</p>
                </div>
              )}
              {pays.sante_details?.dengue && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">🦟 Dengue</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pays.sante_details.dengue}</p>
                </div>
              )}
              {pays.sante_details?.eau && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">💧 Eau</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pays.sante_details.eau}</p>
                </div>
              )}
            </div>
          </InfoCard>

          {Array.isArray(pays.zones_deconseillees) && pays.zones_deconseillees.length > 0 && (
            <InfoCard id="zones" title="🚨 Zones à éviter" gradient={INFO_GRADIENTS[3]} photo="/images/infos/zones.jpg" expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('zones')}>
              <div className="flex flex-col gap-2">
                {(pays.zones_deconseillees as { zone: string; niveau: string; note: string }[]).map((z, i) => {
                  const style = z.niveau === 'rouge'
                    ? { bg: 'bg-red-50 border-red-200', text: 'text-red-700', emoji: '🔴' }
                    : { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', emoji: '🟠' }
                  return (
                    <div key={i} className={`rounded-xl px-3 py-2.5 border ${style.bg}`}>
                      <p className={`text-xs font-semibold ${style.text} mb-1`}>{style.emoji} {z.zone}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{z.note}</p>
                    </div>
                  )
                })}
              </div>
            </InfoCard>
          )}

          <InfoCard id="urgences" title="🆘 Numéros d'urgence" gradient={INFO_GRADIENTS[4]} photo="/images/infos/urgences.jpg" expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('urgences')}>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Police', number: pays.urgence_police, emoji: '🚔' },
                  { label: 'Ambulance', number: pays.urgence_ambulance, emoji: '🚑' },
                  { label: 'Ambassade', number: pays.urgence_ambassade_france, emoji: '🇫🇷' },
                ].map(u => (
                  <div key={u.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 text-center">
                    <span className="text-2xl">{u.emoji}</span>
                    <span className="text-xs text-gray-400 leading-tight">{u.label}</span>
                    <span className="text-sm font-bold text-gray-800 break-all">{u.number ?? '–'}</span>
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
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">🇫🇷 Ambassade de France</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pays.ambassade_info.adresse}</p>
                  {pays.ambassade_info.tel_urgence && <p className="text-xs text-gray-500 leading-relaxed mt-1">Urgence consulaire : {pays.ambassade_info.tel_urgence}</p>}
                </div>
              )}
            </div>
          </InfoCard>

          <InfoCard id="devise" title="💰 Devise" gradient={INFO_GRADIENTS[5]} photo="/images/infos/devise.jpg" expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('devise')}>
            <DeviseConverter devise={pays.devise ?? null} symbole={pays.symbole_devise ?? null} tauxLive={tauxLive} tauxApprox={pays.taux_change_approx ?? null} />
          </InfoCard>
          </div>

          <h2 className="font-bold text-gray-800 text-xs px-1 mt-2 uppercase tracking-wider">Pratique</h2>

          <div className="grid grid-cols-3 gap-3">
          <InfoCard id="prise" title="🔌 Prise électrique" gradient={INFO_GRADIENTS[6]} expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('prise')}>
            <p className="text-sm font-semibold text-gray-800">{pays.type_prise_electrique ?? '–'}</p>
          </InfoCard>

          {pays.reseau_mobile_info && (
            <InfoCard id="reseau" title="📶 Réseau & SIM" gradient={INFO_GRADIENTS[7]} photo="/images/infos/reseau.jpg" expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('reseau')}>
              <p className="text-xs text-gray-600 leading-relaxed">{pays.reseau_mobile_info}</p>
            </InfoCard>
          )}

          {pays.douane_infos && (
            <InfoCard id="douane" title="🧳 Douane" gradient={INFO_GRADIENTS[0]} expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('douane')}>
              <p className="text-xs text-gray-600 leading-relaxed">{pays.douane_infos}</p>
            </InfoCard>
          )}

          {pays.transport_info && (
            <InfoCard id="transport" title="✈️ Vols & Aéroports" gradient={INFO_GRADIENTS[1]} expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('transport')}>
              <div className="flex flex-col gap-2.5">
                {pays.transport_info.duree_vol && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-xs font-semibold text-gray-700 mb-0.5">🕐 Durée de vol</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{pays.transport_info.duree_vol}</p>
                  </div>
                )}
                {Array.isArray(pays.transport_info.compagnies_directes) && pays.transport_info.compagnies_directes.length > 0 && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-xs font-semibold text-gray-700 mb-0.5">✈️ Vols directs</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{pays.transport_info.compagnies_directes.join(', ')}</p>
                  </div>
                )}
                {Array.isArray(pays.transport_info.compagnies_escale) && pays.transport_info.compagnies_escale.length > 0 && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-xs font-semibold text-gray-700 mb-0.5">🔄 Avec escale</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{pays.transport_info.compagnies_escale.join(', ')}</p>
                  </div>
                )}
                {Array.isArray(pays.transport_info.aeroports) && pays.transport_info.aeroports.length > 0 && (
                  <div className="flex flex-col">
                    {(pays.transport_info.aeroports as { code: string; nom: string }[]).map((a, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-bold text-gray-800">{a.code}</span>
                        <span className="text-xs text-gray-500 text-right">{a.nom}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </InfoCard>
          )}

          {pays.assurance_info && (
            <InfoCard id="assurance" title="🏥 Assurance voyage" gradient={INFO_GRADIENTS[2]} expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('assurance')}>
              <p className="text-xs text-gray-600 leading-relaxed">{pays.assurance_info}</p>
            </InfoCard>
          )}

          {Array.isArray(pays.sante_details?.trousse_medicale) && pays.sante_details.trousse_medicale.length > 0 && (
            <InfoCard id="trousse" title="💊 Trousse médicale" gradient={INFO_GRADIENTS[3]} expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('trousse')}>
              <ul className="flex flex-col gap-1.5">
                {(pays.sante_details.trousse_medicale as string[]).map((item, i) => (
                  <li key={i} className="text-xs text-gray-600 leading-relaxed flex gap-2">
                    <span className="text-gray-400">•</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </InfoCard>
          )}

          {Array.isArray(pays.phrases_essentielles) && pays.phrases_essentielles.length > 0 && (
            <InfoCard id="phrases" title="💬 Phrases essentielles" gradient={INFO_GRADIENTS[4]} expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('phrases')}>
              <div className="flex flex-col">
                {(pays.phrases_essentielles as { fr: string; langue_locale: string; phonetique: string }[]).map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400 w-20 shrink-0">{p.fr}</span>
                    <span className="text-sm font-semibold text-gray-800 flex-1 text-center">{p.langue_locale}</span>
                    <span className="text-xs text-gray-400 italic w-20 text-right shrink-0">{p.phonetique}</span>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          {Array.isArray(pays.liens_officiels) && pays.liens_officiels.length > 0 && (
            <InfoCard id="liens" title="🔗 Liens officiels" gradient={INFO_GRADIENTS[5]} expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('liens')}>
              <div className="flex flex-col gap-2">
                {(pays.liens_officiels as { label: string; url: string; type: string }[]).map((lien, i) => (
                  <a key={i} href={lien.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-xl border bg-blue-50 border-blue-100 text-xs font-medium text-blue-700">
                    <span>{lien.label}</span><span className="opacity-60">↗</span>
                  </a>
                ))}
              </div>
            </InfoCard>
          )}

          <InfoCard id="bagages" title="🧳 Bagages" gradient={INFO_GRADIENTS[8]} expandedId={expandedInfo} onToggle={toggleInfo} {...infoCardProps('bagages')}>
            <BagagesSection voyageId={voyageId} compagnieInitiale={compagnie} participantId={!isOrganisateur ? currentMembreId : null} />
          </InfoCard>
          </div>
        </div>
      )}

      {/* ─── ACTIVITÉS ─── */}
      {active === 'activites' && (
        <ActivitesSection activites={activites} wishlistIds={wishlistActiviteIds} voyageId={voyageId} />
      )}

      {/* ─── CHECKLIST + VALISE (fusionnées, toujours perso sauf override organisateur) ─── */}
      {active === 'checklist' && (
        <div className="flex flex-col gap-4">
          {!isOrganisateur && modeGestion === 'partage' && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
              <span>🔗</span>
              <span>Ta checklist et ta valise personnelles pour ce voyage partagé.</span>
            </div>
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
          membres={tousLesMembres}
          depensesInitiales={depenses}
          budgetTotal={budgetTotal}
          budgetQuotidien={pays?.budget_quotidien ?? null}
          argentNotes={pays?.argent_notes ?? null}
        />
      )}
    </div>
  )
}
