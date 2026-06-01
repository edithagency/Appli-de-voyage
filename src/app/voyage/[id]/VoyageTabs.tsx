'use client'

import { useState } from 'react'
import ChecklistSection from './ChecklistSection'
import VoyageDocuments from './VoyageDocuments'
import BagagesSection from './BagagesSection'
import CollapsibleSection from './CollapsibleSection'
import EntreAmisTab from './EntreAmisTab'
import ValiseSection from './ValiseSection'

const CODE_TO_ARIANE_SLUG: Record<string, string> = {
  MA: 'maroc', JP: 'japon', TH: 'thailande', PT: 'portugal',
  GR: 'grece', US: 'etats-unis', ID: 'indonesie', MX: 'mexique',
  IT: 'italie', SN: 'senegal',
}

type Pays = Record<string, any>
type Item = { id: string; label: string; description: string | null; obligatoire: boolean; completed: boolean; categorie: string; membre_id: string | null }
type Doc = { id: string; type: string; nom_fichier: string; storage_path: string; date_expiration: string | null; voyage_id: string | null; membre: { prenom: string } | null }
type Membre = { id: string; prenom: string; type: string }
type TravelMember = { id: string; prenom: string; type: 'adulte' | 'enfant' }

export default function VoyageTabs({
  pays, checklist, documents, membres, allTravelMembers, valiseMembers,
  voyageId, voyageNom, dateDepart, dateRetour, compagnie, paysCode,
  depenses, budgetTotal, valiseItems, jours,
  typeVoyage, modeGestion, isOrganisateur, currentParticipantId, voyageUserId,
}: {
  pays: Pays | null
  checklist: Item[]
  documents: Doc[]
  membres: Membre[]
  allTravelMembers: TravelMember[]
  valiseMembers: TravelMember[]
  voyageId: string
  voyageNom: string
  dateDepart: string
  dateRetour: string
  compagnie: string | null
  paysCode: string | null
  depenses: any[]
  budgetTotal: number
  valiseItems: any[]
  jours: number
  typeVoyage: string | null
  modeGestion: string | null
  isOrganisateur: boolean
  currentParticipantId: string | null
  voyageUserId: string
}) {
  const estSolo = !typeVoyage || typeVoyage === 'solo'
  const estGroupe = !estSolo

  // Onglets selon le contexte
  const TABS = [
    { key: 'infos',      label: 'Infos',     emoji: '🌍', show: true },
    { key: 'checklist',  label: 'Checklist', emoji: '✅', show: true },
    { key: 'documents',  label: 'Documents', emoji: '🔒', show: isOrganisateur },
    { key: 'pratique',   label: 'Pratique',  emoji: '🛠️', show: true },
    { key: 'amis',       label: estSolo ? 'Budget' : 'Groupe', emoji: estSolo ? '💰' : '🧑‍🤝‍🧑', show: true },
  ].filter(t => t.show)

  const [active, setActive] = useState('infos')
  const arianeSlug = paysCode ? CODE_TO_ARIANE_SLUG[paysCode] : null
  const arianeUrl = arianeSlug
    ? `https://www.diplomatie.gouv.fr/fr/information-par-pays/${arianeSlug}/conseils-aux-voyageurs-securite`
    : 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/'

  const niveauStyle: Record<string, { bg: string; text: string; label: string }> = {
    vert:   { bg: 'bg-green-50 border-green-200',  text: 'text-green-700',  label: 'Sûr' },
    orange: { bg: 'bg-amber-50 border-amber-200',  text: 'text-amber-700',  label: 'Vigilance recommandée' },
    rouge:  { bg: 'bg-red-50 border-red-200',      text: 'text-red-700',    label: 'Déconseillé' },
  }
  const securite = pays?.niveau_securite ? niveauStyle[pays.niveau_securite] : null

  // Membres pour ChecklistSection "Pour qui ?" (tous les voyageurs)
  const membresChecklist = allTravelMembers.map(m => ({ id: m.id, prenom: m.prenom }))

  // Membres pour EntreAmisTab (tricount)
  // Pour les anciens voyages sans mode_gestion, utiliser membres_foyer si disponible
  const membresTricount = (!modeGestion && membres.length > 0)
    ? membres.map(m => ({ id: m.id, prenom: m.prenom, type: m.type as 'adulte' | 'enfant' }))
    : allTravelMembers.map(m => ({ id: m.id, prenom: m.prenom, type: m.type }))

  return (
    <div className="flex flex-col gap-4">
      {/* Barre d'onglets */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1 flex gap-1">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActive(tab.key)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: active === tab.key ? '#534AB7' : 'transparent',
              color: active === tab.key ? 'white' : '#6B7280',
            }}>
            <span className="text-base">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── INFOS ─── */}
      {active === 'infos' && pays && (
        <div className="flex flex-col gap-3">
          {securite && (
            <CollapsibleSection title={`${pays.niveau_securite === 'vert' ? '🟢' : pays.niveau_securite === 'orange' ? '🟠' : '🔴'} Sécurité — ${securite.label}`}>
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
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl border bg-purple-50 border-purple-200 text-xs font-medium text-purple-700">
                  <span>📋 Consulter les conseils & s&apos;inscrire sur Ariane</span>
                  <span className="opacity-60">↗</span>
                </a>
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-700">Ariane</span> est le service d&apos;inscription du Ministère de l&apos;Europe et des Affaires étrangères. En cas de crise, l&apos;ambassade peut vous contacter. <span className="font-medium">Inscription gratuite et vivement conseillée.</span>
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          )}

          <CollapsibleSection title="🛂 Visa">
            <p className="text-sm font-semibold text-gray-800 mb-1">{pays.visa_requis_france ? '⚠️ Requis' : '✅ Pas requis'}</p>
            {pays.visa_details && <p className="text-xs text-gray-500 leading-relaxed">{pays.visa_details}</p>}
          </CollapsibleSection>

          <CollapsibleSection title="💉 Vaccins">
            <p className="text-sm font-semibold text-gray-800 mb-1">{pays.vaccins_obligatoires ? '⚠️ Obligatoires' : 'Aucun obligatoire'}</p>
            {pays.vaccins_recommandes && <p className="text-xs text-gray-500 leading-relaxed">{pays.vaccins_recommandes}</p>}
          </CollapsibleSection>

          <CollapsibleSection title="💰 Devise">
            <p className="text-sm font-semibold text-gray-800 mb-1">{pays.devise ?? '–'}</p>
            {pays.taux_change_approx && pays.taux_change_approx !== 1 ? (
              <p className="text-xs text-gray-500">
                {(() => {
                  const r = pays.taux_change_approx
                  const fmt = (n: number) => n >= 10 ? n.toFixed(0) : n >= 1 ? n.toFixed(1) : n.toFixed(2)
                  return `1€ ≈ ${fmt(r)} ${pays.symbole_devise} · 10€ ≈ ${fmt(r * 10)} ${pays.symbole_devise}`
                })()}
              </p>
            ) : pays.symbole_devise === 'EUR' ? (
              <p className="text-xs text-gray-500">Même devise — pas de change</p>
            ) : null}
          </CollapsibleSection>

          {Array.isArray(pays.liens_officiels) && pays.liens_officiels.length > 0 && (
            <CollapsibleSection title="🔗 Liens officiels">
              <div className="flex flex-col gap-2">
                {(pays.liens_officiels as { label: string; url: string; type: string }[]).map((lien, i) => (
                  <a key={i} href={lien.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-xl border bg-purple-50 border-purple-200 text-xs font-medium text-purple-700">
                    <span>{lien.label}</span>
                    <span className="opacity-60">↗</span>
                  </a>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}

      {/* ─── CHECKLIST + VALISE ─── */}
      {active === 'checklist' && (
        <div className="flex flex-col gap-4">
          {/* Bandeau mode B participant */}
          {!isOrganisateur && modeGestion === 'B' && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
              <span>🔗</span>
              <span>Ta checklist et ta valise personnelles pour ce voyage partagé.</span>
            </div>
          )}

          <ChecklistSection
            items={checklist}
            voyageId={voyageId}
            voyageNom={voyageNom}
            dateDepart={dateDepart}
            dateRetour={dateRetour}
            membres={membresChecklist}
            participantId={currentParticipantId}
          />
          <ValiseSection
            voyageId={voyageId}
            membres={valiseMembers}
            itemsInitiaux={valiseItems}
            jours={jours}
            paysCode={paysCode}
            dateDepart={dateDepart}
            onGoToPratique={() => setActive('pratique')}
          />
        </div>
      )}

      {/* ─── DOCUMENTS (organisateur uniquement) ─── */}
      {active === 'documents' && isOrganisateur && (
        <VoyageDocuments documents={documents} membres={membres} voyageId={voyageId} />
      )}

      {/* ─── PRATIQUE ─── */}
      {active === 'pratique' && pays && (
        <div className="flex flex-col gap-3">
          <CollapsibleSection title="🔌 Prise électrique">
            <p className="text-sm font-semibold text-gray-800">{pays.type_prise_electrique ?? '–'}</p>
          </CollapsibleSection>

          {pays.douane_infos && (
            <CollapsibleSection title="🧳 Douane">
              <p className="text-xs text-gray-600 leading-relaxed">{pays.douane_infos}</p>
            </CollapsibleSection>
          )}

          <CollapsibleSection title="🆘 Numéros d'urgence">
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
          </CollapsibleSection>

          {Array.isArray(pays.phrases_essentielles) && pays.phrases_essentielles.length > 0 && (
            <CollapsibleSection title="💬 Phrases essentielles">
              <div className="flex flex-col">
                {(pays.phrases_essentielles as { fr: string; langue_locale: string; phonetique: string }[]).map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400 w-20 shrink-0">{p.fr}</span>
                    <span className="text-sm font-semibold text-gray-800 flex-1 text-center">{p.langue_locale}</span>
                    <span className="text-xs text-gray-400 italic w-20 text-right shrink-0">{p.phonetique}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          <BagagesSection
            voyageId={voyageId}
            compagnieInitiale={compagnie}
            participantId={!isOrganisateur ? currentParticipantId : null}
          />
        </div>
      )}

      {/* ─── GROUPE / BUDGET ─── */}
      {active === 'amis' && (
        <EntreAmisTab
          voyageId={voyageId}
          membres={membresTricount}
          depensesInitiales={depenses}
          budgetTotal={budgetTotal}
        />
      )}
    </div>
  )
}
