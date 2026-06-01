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

type Membre = { id: string; prenom: string; type: string; date_naissance: string | null }

type ChecklistItem = {
  categorie: 'documents' | 'sante' | 'bagages' | 'argent' | 'logistique' | 'avant_depart'
  label: string
  description: string | null
  obligatoire: boolean
  ordre: number
  membre_id: string | null
}

export function generateChecklist(
  pays: Pays | null,
  membres: Membre[],
  dureeJours: number
): ChecklistItem[] {
  const items: ChecklistItem[] = []
  let ordre = 0
  const next = () => ordre++

  const adultes = membres.filter(m => m.type === 'adulte')
  const enfants = membres.filter(m => m.type === 'enfant')
  const voyageAvec1SeulAdulte = adultes.length === 1 && enfants.length > 0
  const nomPays = pays?.nom_fr ?? 'destination'

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────

  // Passeport — pour chaque membre
  if (membres.length === 0) {
    items.push({
      categorie: 'documents',
      label: 'Passeport valide',
      description: 'Valable au moins 6 mois après la date de retour.',
      obligatoire: true,
      ordre: next(),
      membre_id: null,
    })
  } else {
    for (const m of membres) {
      items.push({
        categorie: 'documents',
        label: `Passeport valide — ${m.prenom}`,
        description: 'Valable au moins 6 mois après la date de retour.',
        obligatoire: true,
        ordre: next(),
        membre_id: m.id,
      })
    }
  }

  // Photocopies
  items.push({
    categorie: 'documents',
    label: 'Photocopies des documents importants',
    description: 'Passeports, billets, assurance. Garder une copie numérique dans le cloud.',
    obligatoire: true,
    ordre: next(),
    membre_id: null,
  })

  // ESTA (USA)
  if (pays?.esta_requis) {
    items.push({
      categorie: 'documents',
      label: 'ESTA à demander en ligne',
      description: pays.visa_details ?? 'Obligatoire pour entrer aux États-Unis. Valable 2 ans.',
      obligatoire: true,
      ordre: next(),
      membre_id: null,
    })
  }

  // Visa
  if (pays?.visa_requis_france && !pays?.esta_requis) {
    items.push({
      categorie: 'documents',
      label: `Visa pour ${nomPays}`,
      description: pays.visa_details,
      obligatoire: true,
      ordre: next(),
      membre_id: null,
    })
  }

  // Taxe touristique Bali (à payer en ligne avant)
  if (pays?.taxe_touristique_mode === 'en_ligne_avant') {
    items.push({
      categorie: 'documents',
      label: `Taxe touristique ${nomPays} — ${pays.taxe_touristique_montant}`,
      description: pays.taxe_touristique_notes,
      obligatoire: true,
      ordre: next(),
      membre_id: null,
    })
  }

  // Autorisation sortie territoire enfant
  if (voyageAvec1SeulAdulte) {
    for (const enfant of enfants) {
      items.push({
        categorie: 'documents',
        label: `Autorisation de sortie du territoire — ${enfant.prenom}`,
        description: 'Formulaire officiel sur service-public.fr. Obligatoire pour un mineur qui voyage avec un seul parent.',
        obligatoire: true,
        ordre: next(),
        membre_id: enfant.id,
      })
    }
  }

  // Autorisation parentale si pays l'exige
  if (pays?.autorisation_enfant_seul_parent && !voyageAvec1SeulAdulte && enfants.length > 0) {
    items.push({
      categorie: 'documents',
      label: `Autorisation parentale pour ${nomPays}`,
      description: pays.autorisation_enfant_details,
      obligatoire: true,
      ordre: next(),
      membre_id: null,
    })
  }

  // Billet d'avion
  items.push({
    categorie: 'documents',
    label: 'Billet d\'avion (aller-retour)',
    description: 'Imprimer ou sauvegarder en mode hors-ligne.',
    obligatoire: true,
    ordre: next(),
    membre_id: null,
  })

  // Réservation hébergement
  items.push({
    categorie: 'documents',
    label: 'Réservation hébergement',
    description: 'Imprimer ou sauvegarder la confirmation.',
    obligatoire: true,
    ordre: next(),
    membre_id: null,
  })

  // Assurance voyage
  items.push({
    categorie: 'documents',
    label: 'Attestation d\'assurance voyage',
    description: 'Vérifier que le rapatriement médical est inclus.',
    obligatoire: true,
    ordre: next(),
    membre_id: null,
  })

  // Carnet de vaccination (si pays exige)
  if (pays?.vaccins_obligatoires) {
    items.push({
      categorie: 'documents',
      label: 'Carnet de vaccination international',
      description: `À présenter à l'arrivée : ${pays.vaccins_obligatoires}`,
      obligatoire: true,
      ordre: next(),
      membre_id: null,
    })
  }

  // ─── SANTÉ ────────────────────────────────────────────────────────────────

  // Vaccins obligatoires
  if (pays?.vaccins_obligatoires) {
    items.push({
      categorie: 'sante',
      label: `Vaccin obligatoire — ${pays.vaccin_obligatoire_nom === 'fievre_jaune' ? 'Fièvre jaune' : 'Voir détails'}`,
      description: pays.vaccins_obligatoires + ' (à faire au moins 10 jours avant le départ).',
      obligatoire: true,
      ordre: next(),
      membre_id: null,
    })
  }

  // Vaccins recommandés
  if (pays?.vaccins_recommandes) {
    items.push({
      categorie: 'sante',
      label: 'Vaccins recommandés',
      description: pays.vaccins_recommandes,
      obligatoire: false,
      ordre: next(),
      membre_id: null,
    })
  }

  // Trousse à pharmacie
  items.push({
    categorie: 'sante',
    label: 'Trousse à pharmacie',
    description: 'Antiseptique, pansements, antidouleur, antihistaminique, thermomètre.',
    obligatoire: true,
    ordre: next(),
    membre_id: null,
  })

  // Médicaments personnels
  items.push({
    categorie: 'sante',
    label: 'Médicaments personnels + ordonnances',
    description: 'Prévoir une quantité supérieure à la durée du voyage. Garder dans le bagage cabine.',
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  // Médicaments enfants
  if (enfants.length > 0) {
    items.push({
      categorie: 'sante',
      label: 'Médicaments enfants',
      description: 'Fièvre, douleur, diarrhée. Adapter aux âges des enfants.',
      obligatoire: false,
      ordre: next(),
      membre_id: null,
    })
  }

  // Protection solaire
  items.push({
    categorie: 'sante',
    label: 'Crème solaire & protection',
    description: dureeJours >= 5 ? 'Prévoir en quantité suffisante pour tout le séjour.' : null,
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  // ─── ARGENT ───────────────────────────────────────────────────────────────

  // Prévenir la banque
  items.push({
    categorie: 'argent',
    label: 'Prévenir sa banque du voyage',
    description: 'À faire avant le départ pour éviter le blocage de la carte à l\'étranger.',
    obligatoire: true,
    ordre: next(),
    membre_id: null,
  })

  // Carte sans frais
  items.push({
    categorie: 'argent',
    label: 'Vérifier / obtenir une carte sans frais à l\'étranger',
    description: 'Revolut, Wise ou N26 : ouvrir et approvisionner le compte avant le départ.',
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  // Changer de la monnaie avant le départ
  if (pays?.devise && !pays.devise.includes('EUR')) {
    items.push({
      categorie: 'argent',
      label: `Changer des ${pays.devise} avant le départ`,
      description: 'Prévoir un peu de liquide pour les premiers frais à l\'arrivée (taxi, petit déjeuner...).',
      obligatoire: false,
      ordre: next(),
      membre_id: null,
    })
  }

  // Note sur taxe de séjour à l'hôtel (informatif, pas une action pré-départ)
  if (pays?.taxe_touristique_mode === 'hotel' && pays.taxe_touristique_montant) {
    items.push({
      categorie: 'argent',
      label: `À savoir : taxe de séjour ${nomPays} — ${pays.taxe_touristique_montant}`,
      description: pays.taxe_touristique_notes ?? 'Payable à l\'établissement sur place.',
      obligatoire: false,
      ordre: next(),
      membre_id: null,
    })
  }

  // ─── BAGAGES ──────────────────────────────────────────────────────────────

  // Adaptateur
  if (pays?.type_prise_electrique && !pays.type_prise_electrique.toLowerCase().includes('identique à la france')) {
    items.push({
      categorie: 'bagages',
      label: 'Adaptateur électrique',
      description: `${pays.type_prise_electrique}. Prévoir un adaptateur universel.`,
      obligatoire: true,
      ordre: next(),
      membre_id: null,
    })
  }

  // Valises / bagages
  items.push({
    categorie: 'bagages',
    label: 'Vérifier les limites de bagages',
    description: 'Confirmer le poids autorisé en soute et cabine avec ta compagnie aérienne.',
    obligatoire: true,
    ordre: next(),
    membre_id: null,
  })

  items.push({
    categorie: 'bagages',
    label: 'Vêtements adaptés au climat',
    description: null,
    obligatoire: true,
    ordre: next(),
    membre_id: null,
  })

  items.push({
    categorie: 'bagages',
    label: 'Chargeurs & câbles',
    description: 'Téléphone, appareil photo, tablette...',
    obligatoire: true,
    ordre: next(),
    membre_id: null,
  })

  if (dureeJours >= 7) {
    items.push({
      categorie: 'bagages',
      label: 'Cadenas pour bagages',
      description: null,
      obligatoire: false,
      ordre: next(),
      membre_id: null,
    })
  }

  // ─── LOGISTIQUE ───────────────────────────────────────────────────────────

  // S'inscrire sur Ariane
  const arianeSlugMap: Record<string, string> = {
    MA: 'maroc', JP: 'japon', TH: 'thailande', PT: 'portugal',
    GR: 'grece', US: 'etats-unis', ID: 'indonesie', MX: 'mexique',
    IT: 'italie', SN: 'senegal',
  }
  const arianeSlug = pays?.code ? arianeSlugMap[pays.code] : null
  const arianeUrl = arianeSlug
    ? `https://www.diplomatie.gouv.fr/fr/information-par-pays/${arianeSlug}/conseils-aux-voyageurs-securite`
    : 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/'

  items.push({
    categorie: 'logistique',
    label: 'S\'inscrire sur Ariane',
    description: `Service gratuit du Ministère des Affaires étrangères. En cas de crise, l'ambassade peut vous contacter. | ${arianeUrl}`,
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  // SIM internationale
  items.push({
    categorie: 'logistique',
    label: 'Connexion internet à l\'étranger',
    description: 'SIM locale à l\'arrivée, eSIM Airalo, ou vérifier le roaming avec ton opérateur.',
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  // Transfert aéroport
  items.push({
    categorie: 'logistique',
    label: 'Transfert aéroport → hébergement',
    description: 'Réserver à l\'avance ou vérifier les options sur place.',
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  // Assurance annulation
  items.push({
    categorie: 'logistique',
    label: 'Assurance annulation',
    description: 'Vérifier si incluse dans ta carte bancaire ou à souscrire séparément.',
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  // ─── AVANT LE DÉPART ──────────────────────────────────────────────────────

  items.push({
    categorie: 'avant_depart',
    label: 'Stopper le courrier ou le faire récupérer',
    description: null,
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  items.push({
    categorie: 'avant_depart',
    label: 'Confier les plantes et animaux',
    description: null,
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  items.push({
    categorie: 'avant_depart',
    label: 'Couper le chauffage / climatisation',
    description: null,
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  items.push({
    categorie: 'avant_depart',
    label: 'Télécharger les cartes hors-ligne',
    description: 'Google Maps ou Maps.me permettent d\'utiliser les cartes sans connexion.',
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  items.push({
    categorie: 'avant_depart',
    label: 'Partager l\'itinéraire à un proche',
    description: 'Donner les coordonnées de l\'hébergement à un ami ou de la famille.',
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  items.push({
    categorie: 'avant_depart',
    label: 'Vérifier l\'enregistrement en ligne',
    description: 'Check-in disponible 24 à 48h avant le vol.',
    obligatoire: false,
    ordre: next(),
    membre_id: null,
  })

  return items
}
