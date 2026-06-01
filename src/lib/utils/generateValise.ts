export type QuestionnaireValise = {
  prenom: string
  sexe: 'homme' | 'femme'
  age: 'adulte' | 'enfant'
  jours: number
  temperature: 'froid' | 'doux' | 'chaud' | 'tropical'
  activites: string[]
  bagages: string[] // 'main', 'cabine', 'soute_20', 'soute_23'
}

type ValiseItem = {
  categorie: 'vetements' | 'hygiene' | 'electronique' | 'medicaments' | 'documents' | 'divers'
  label: string
  quantite?: string
  obligatoire: boolean
}

function qty(n: number, label: string): string {
  return `${n} ${label}${n > 1 ? 's' : ''}`
}

export function generateValise(q: QuestionnaireValise): ValiseItem[] {
  const items: ValiseItem[] = []
  const { jours, sexe, age, temperature, activites, bagages } = q
  const isCabine = bagages.includes('cabine') && !bagages.includes('soute_20') && !bagages.includes('soute_23')
  const hasSoute = bagages.includes('soute_20') || bagages.includes('soute_23')
  const isEnfant = age === 'enfant'
  const isFemme = sexe === 'femme'
  const isChaud = temperature === 'chaud' || temperature === 'tropical'
  const isFroid = temperature === 'froid'
  const isPlage = activites.includes('plage')
  const isMontagne = activites.includes('montagne')
  const isBusiness = activites.includes('business')
  const isVille = activites.includes('ville')

  const nbHauts = Math.min(isCabine ? 4 : jours + 1, isCabine ? 4 : 10)
  const nbBas = Math.min(isCabine ? 2 : Math.ceil(jours / 2) + 1, isCabine ? 2 : 6)
  const nbSousVet = Math.min(isCabine ? 4 : jours + 1, isCabine ? 4 : 10)
  const nbChaussettes = nbSousVet

  // ─── VÊTEMENTS ────────────────────────────────────────────
  items.push({
    categorie: 'vetements',
    label: isChaud ? 'T-shirts / tops' : 'T-shirts & pulls',
    quantite: qty(nbHauts, isChaud ? 't-shirt' : 'haut'),
    obligatoire: false,
  })

  if (!isCabine || !isChaud) {
    items.push({
      categorie: 'vetements',
      label: isFroid ? 'Pulls / sweats chauds' : 'Pulls légers / sweats',
      quantite: qty(Math.min(2, Math.ceil(jours / 3)), 'pull'),
      obligatoire: isFroid,
    })
  }

  items.push({
    categorie: 'vetements',
    label: isChaud ? 'Shorts / bermudas' : 'Pantalons',
    quantite: qty(nbBas, isChaud ? 'short' : 'pantalon'),
    obligatoire: false,
  })

  if (isFemme) {
    items.push({ categorie: 'vetements', label: 'Robes / jupes', quantite: qty(Math.min(2, jours), 'robe'), obligatoire: false })
    items.push({ categorie: 'vetements', label: 'Soutiens-gorge', quantite: qty(Math.min(3, jours), 'soutien-gorge'), obligatoire: false })
  }

  items.push({
    categorie: 'vetements',
    label: 'Sous-vêtements',
    quantite: qty(nbSousVet, 'paire'),
    obligatoire: false,
  })

  items.push({
    categorie: 'vetements',
    label: 'Chaussettes',
    quantite: qty(nbChaussettes, 'paire'),
    obligatoire: false,
  })

  if (isFroid) {
    items.push({ categorie: 'vetements', label: 'Manteau / doudoune', quantite: '1', obligatoire: false })
    items.push({ categorie: 'vetements', label: 'Écharpe & bonnet', obligatoire: false })
    items.push({ categorie: 'vetements', label: 'Sous-vêtements thermiques', obligatoire: false })
  }

  if (isPlage) {
    items.push({ categorie: 'vetements', label: 'Maillot de bain', quantite: qty(isFemme ? 2 : 1, 'maillot'), obligatoire: false })
    items.push({ categorie: 'vetements', label: 'Pareo / serviette de plage', obligatoire: false })
    items.push({ categorie: 'vetements', label: 'Chapeau / casquette', obligatoire: false })
    items.push({ categorie: 'vetements', label: 'Lunettes de soleil', obligatoire: false })
  }

  if (isMontagne) {
    items.push({ categorie: 'vetements', label: 'Vêtements de randonnée / imperméable', obligatoire: false })
    items.push({ categorie: 'vetements', label: 'Chaussures de randonnée', obligatoire: false })
    items.push({ categorie: 'vetements', label: 'Gants & bonnet', obligatoire: isFroid })
  }

  if (isBusiness) {
    items.push({ categorie: 'vetements', label: isFemme ? 'Tenue professionnelle (blazer, chemisier)' : 'Costume / chemises', obligatoire: false })
    items.push({ categorie: 'vetements', label: isFemme ? 'Escarpins / chaussures habillées' : 'Chaussures habillées', obligatoire: false })
  }

  // Chaussures
  items.push({ categorie: 'vetements', label: 'Chaussures de ville / sneakers', obligatoire: false })
  if (isChaud && isPlage) {
    items.push({ categorie: 'vetements', label: 'Sandales / tongs', obligatoire: false })
  }

  // Tenue de nuit
  items.push({ categorie: 'vetements', label: 'Pyjama', quantite: qty(Math.min(2, Math.ceil(jours / 4)), 'pyjama'), obligatoire: false })

  // Tenue de sport
  if (activites.includes('sport')) {
    items.push({ categorie: 'vetements', label: 'Tenue de sport', obligatoire: false })
    items.push({ categorie: 'vetements', label: 'Chaussures de sport', obligatoire: false })
  }

  // ─── HYGIÈNE ──────────────────────────────────────────────
  items.push({ categorie: 'hygiene', label: 'Brosse à dents + dentifrice', obligatoire: false })
  items.push({ categorie: 'hygiene', label: 'Shampoing + après-shampoing', obligatoire: false })
  items.push({ categorie: 'hygiene', label: 'Gel douche / savon', obligatoire: false })
  items.push({ categorie: 'hygiene', label: 'Déodorant', obligatoire: false })

  if (isFemme) {
    items.push({ categorie: 'hygiene', label: 'Produits menstruels', obligatoire: false })
    items.push({ categorie: 'hygiene', label: 'Maquillage essentiel', obligatoire: false })
    items.push({ categorie: 'hygiene', label: 'Démaquillant / coton', obligatoire: false })
    items.push({ categorie: 'hygiene', label: 'Sèche-cheveux (ou vérifier hôtel)', obligatoire: false })
  } else {
    items.push({ categorie: 'hygiene', label: 'Rasoir + mousse à raser', obligatoire: false })
  }

  if (isChaud || isPlage) {
    items.push({ categorie: 'hygiene', label: 'Crème solaire (SPF 50)', obligatoire: false })
    items.push({ categorie: 'hygiene', label: 'After-sun / hydratant', obligatoire: false })
    items.push({ categorie: 'hygiene', label: 'Répulsif anti-moustiques', obligatoire: temperature === 'tropical' })
  }

  items.push({ categorie: 'hygiene', label: 'Coupe-ongles / petite trousse', obligatoire: false })
  if (!isCabine) {
    items.push({ categorie: 'hygiene', label: 'Gel hydroalcoolique', obligatoire: false })
  }

  // Enfants
  if (isEnfant) {
    items.push({ categorie: 'hygiene', label: 'Shampoing enfant', obligatoire: false })
    items.push({ categorie: 'hygiene', label: 'Lingettes', obligatoire: false })
    items.push({ categorie: 'hygiene', label: 'Couches (si besoin)', obligatoire: false })
  }

  // ─── MÉDICAMENTS ──────────────────────────────────────────
  items.push({ categorie: 'medicaments', label: 'Antidouleur (paracétamol / ibuprofène)', obligatoire: false })
  items.push({ categorie: 'medicaments', label: 'Médicaments anti-diarrhée', obligatoire: false })
  items.push({ categorie: 'medicaments', label: 'Antihistaminique (allergie)', obligatoire: false })
  items.push({ categorie: 'medicaments', label: 'Pansements & désinfectant', obligatoire: false })
  items.push({ categorie: 'medicaments', label: 'Médicaments personnels + ordonnances', obligatoire: false })

  if (temperature === 'tropical') {
    items.push({ categorie: 'medicaments', label: 'Traitement anti-paludéen (si prescrit)', obligatoire: false })
    items.push({ categorie: 'medicaments', label: 'Sérum de réhydratation orale', obligatoire: false })
  }

  if (isMontagne) {
    items.push({ categorie: 'medicaments', label: 'Crème anti-ampoules', obligatoire: false })
    items.push({ categorie: 'medicaments', label: 'Médicament contre le mal des transports', obligatoire: false })
  }

  if (isEnfant) {
    items.push({ categorie: 'medicaments', label: 'Médicaments enfant (fièvre, douleurs)', obligatoire: false })
    items.push({ categorie: 'medicaments', label: 'Thermomètre', obligatoire: false })
  }

  // ─── ÉLECTRONIQUE ─────────────────────────────────────────
  items.push({ categorie: 'electronique', label: 'Téléphone + chargeur', obligatoire: false })
  items.push({ categorie: 'electronique', label: 'Batterie externe / powerbank', obligatoire: false })
  items.push({ categorie: 'electronique', label: 'Adaptateur universel', obligatoire: false })
  items.push({ categorie: 'electronique', label: 'Écouteurs / casque', obligatoire: false })

  if (jours > 5) {
    items.push({ categorie: 'electronique', label: 'Appareil photo', obligatoire: false })
  }

  if (isBusiness) {
    items.push({ categorie: 'electronique', label: 'Ordinateur portable + chargeur', obligatoire: false })
  }

  // ─── DOCUMENTS ────────────────────────────────────────────
  items.push({ categorie: 'documents', label: 'Passeport / carte d\'identité', obligatoire: true })
  items.push({ categorie: 'documents', label: 'Billets d\'avion (imprimés ou appli)', obligatoire: true })
  items.push({ categorie: 'documents', label: 'Réservation hôtel', obligatoire: false })
  items.push({ categorie: 'documents', label: 'Attestation d\'assurance voyage', obligatoire: true })
  items.push({ categorie: 'documents', label: 'Cartes bancaires', obligatoire: true })
  items.push({ categorie: 'documents', label: 'Espèces en monnaie locale', obligatoire: false })

  // ─── DIVERS ───────────────────────────────────────────────
  items.push({ categorie: 'divers', label: 'Sac à dos / tote bag pour les sorties', obligatoire: false })
  if (!isCabine) {
    items.push({ categorie: 'divers', label: 'Cadenas pour la valise', obligatoire: false })
    items.push({ categorie: 'divers', label: 'Balance de valise', obligatoire: false })
  }
  items.push({ categorie: 'divers', label: 'Oreiller de voyage / masque de nuit', obligatoire: false })
  items.push({ categorie: 'divers', label: 'Bouteille d\'eau réutilisable', obligatoire: false })

  if (isPlage) {
    items.push({ categorie: 'divers', label: 'Sac de plage imperméable', obligatoire: false })
  }

  if (isEnfant) {
    items.push({ categorie: 'divers', label: 'Jouets / activités pour l\'avion', obligatoire: false })
    items.push({ categorie: 'divers', label: 'Doudou / peluche', obligatoire: false })
  }

  return items
}
