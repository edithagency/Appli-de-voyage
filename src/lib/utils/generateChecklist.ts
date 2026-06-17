type Pays = {
  code: string
  nom_fr: string
  visa_requis_france: boolean
  visa_details: string | null
  esta_requis: boolean
  vaccins_obligatoires: string | null
  vaccin_obligatoire_nom: string | null
  vaccins_recommandes: string | null
  taxe_touristique_montant: string | null
  taxe_touristique_mode: string | null
  taxe_touristique_notes: string | null
  douane_infos: string | null
  devise: string | null
  type_prise_electrique: string | null
  autorisation_enfant_seul_parent: boolean
  autorisation_enfant_details: string | null
}

type Membre = { prenom: string; type: 'adulte' | 'enfant' }

type ChecklistItem = {
  categorie: 'documents' | 'sante' | 'bagages' | 'argent' | 'logistique' | 'avant_depart'
  sous_categorie: null
  label: string
  description: string | null
  obligatoire: boolean
  ordre: number
}

// contexteGroupe : nombre d'adultes/enfants dans TOUT le groupe (pas que ce membre),
// nécessaire pour les règles comme "autorisation de sortie du territoire si un seul adulte voyage"
export function generateChecklist(
  pays: Pays | null,
  membre: Membre,
  contexteGroupe: { nbAdultes: number; nbEnfants: number },
  dureeJours: number
): ChecklistItem[] {
  const items: ChecklistItem[] = []
  let ordre = 0
  const next = () => ordre++

  const voyageAvec1SeulAdulte = contexteGroupe.nbAdultes === 1 && contexteGroupe.nbEnfants > 0
  const nomPays = pays?.nom_fr ?? 'destination'

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────

  items.push({
    categorie: 'documents',
    sous_categorie: null,
    label: 'Passeport valide',
    description: 'Valable au moins 6 mois après la date de retour.',
    obligatoire: true,
    ordre: next(),
  })

  items.push({
    categorie: 'documents',
    sous_categorie: null,
    label: 'Photocopies des documents importants',
    description: 'Passeports, billets, assurance. Garder une copie numérique dans le cloud.',
    obligatoire: true,
    ordre: next(),
  })

  // Autorisation de sortie du territoire (enfant voyageant avec un seul adulte du groupe)
  if (membre.type === 'enfant' && voyageAvec1SeulAdulte) {
    items.push({
      categorie: 'documents',
      sous_categorie: null,
      label: 'Autorisation de sortie du territoire',
      description: 'Formulaire officiel sur service-public.fr. Obligatoire pour un mineur qui voyage avec un seul parent.',
      obligatoire: true,
      ordre: next(),
    })
  }

  // Autorisation parentale si le pays l'exige
  if (membre.type === 'enfant' && pays?.autorisation_enfant_seul_parent && !voyageAvec1SeulAdulte) {
    items.push({
      categorie: 'documents',
      sous_categorie: null,
      label: `Autorisation parentale pour ${nomPays}`,
      description: pays.autorisation_enfant_details,
      obligatoire: true,
      ordre: next(),
    })
  }

  items.push({
    categorie: 'documents',
    sous_categorie: null,
    label: 'Billet d\'avion (aller-retour)',
    description: 'Imprimer ou sauvegarder en mode hors-ligne.',
    obligatoire: true,
    ordre: next(),
  })

  items.push({
    categorie: 'documents',
    sous_categorie: null,
    label: 'Réservation hébergement',
    description: 'Imprimer ou sauvegarder la confirmation.',
    obligatoire: true,
    ordre: next(),
  })

  items.push({
    categorie: 'documents',
    sous_categorie: null,
    label: 'Attestation d\'assurance voyage',
    description: 'Vérifier que le rapatriement médical est inclus.',
    obligatoire: true,
    ordre: next(),
  })

  // ─── SANTÉ ────────────────────────────────────────────────────────────────

  items.push({
    categorie: 'sante',
    sous_categorie: null,
    label: 'Trousse à pharmacie',
    description: 'Antiseptique, pansements, antidouleur, antihistaminique, thermomètre.',
    obligatoire: true,
    ordre: next(),
  })

  items.push({
    categorie: 'sante',
    sous_categorie: null,
    label: 'Médicaments personnels + ordonnances',
    description: 'Prévoir une quantité supérieure à la durée du voyage. Garder dans le bagage cabine.',
    obligatoire: false,
    ordre: next(),
  })

  if (membre.type === 'enfant') {
    items.push({
      categorie: 'sante',
      sous_categorie: null,
      label: 'Médicaments enfant',
      description: 'Fièvre, douleur, diarrhée. Adapter à son âge.',
      obligatoire: false,
      ordre: next(),
    })
  }

  items.push({
    categorie: 'sante',
    sous_categorie: null,
    label: 'Crème solaire & protection',
    description: dureeJours >= 5 ? 'Prévoir en quantité suffisante pour tout le séjour.' : null,
    obligatoire: false,
    ordre: next(),
  })

  // ─── LOGISTIQUE ───────────────────────────────────────────────────────────

  items.push({
    categorie: 'logistique',
    sous_categorie: null,
    label: 'Connexion internet à l\'étranger',
    description: 'SIM locale à l\'arrivée, eSIM Airalo, ou vérifier le roaming avec ton opérateur.',
    obligatoire: false,
    ordre: next(),
  })

  items.push({
    categorie: 'logistique',
    sous_categorie: null,
    label: 'Transfert aéroport → hébergement',
    description: 'Réserver à l\'avance ou vérifier les options sur place.',
    obligatoire: false,
    ordre: next(),
  })

  items.push({
    categorie: 'logistique',
    sous_categorie: null,
    label: 'Assurance annulation',
    description: 'Vérifier si incluse dans ta carte bancaire ou à souscrire séparément.',
    obligatoire: false,
    ordre: next(),
  })

  // ─── AVANT LE DÉPART ──────────────────────────────────────────────────────

  items.push({ categorie: 'avant_depart', sous_categorie: null, label: 'Stopper le courrier ou le faire récupérer', description: null, obligatoire: false, ordre: next() })
  items.push({ categorie: 'avant_depart', sous_categorie: null, label: 'Confier les plantes et animaux', description: null, obligatoire: false, ordre: next() })
  items.push({ categorie: 'avant_depart', sous_categorie: null, label: 'Couper le chauffage / climatisation', description: null, obligatoire: false, ordre: next() })
  items.push({ categorie: 'avant_depart', sous_categorie: null, label: 'Télécharger les cartes hors-ligne', description: 'Google Maps ou Maps.me permettent d\'utiliser les cartes sans connexion.', obligatoire: false, ordre: next() })
  items.push({ categorie: 'avant_depart', sous_categorie: null, label: 'Partager l\'itinéraire à un proche', description: 'Donner les coordonnées de l\'hébergement à un ami ou de la famille.', obligatoire: false, ordre: next() })
  items.push({ categorie: 'avant_depart', sous_categorie: null, label: 'Vérifier l\'enregistrement en ligne', description: 'Check-in disponible 24 à 48h avant le vol.', obligatoire: false, ordre: next() })

  return items
}
