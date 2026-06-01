export type ReglesBagages = {
  cabine: { poids: string; dimensions: string; inclus: boolean }
  soute: { poids: string; inclus: boolean; prix_aprox?: string }
  bagage_personnel: { dimensions: string; inclus: boolean }
  notes?: string
}

export type Compagnie = {
  id: string
  nom: string
  emoji: string
  couleur: string
  couleurTexte: string
  type: 'low_cost' | 'classique' | 'long_courrier'
  bagages: ReglesBagages
}

export const COMPAGNIES: Compagnie[] = [
  {
    id: 'air-france',
    nom: 'Air France',
    emoji: '',
    couleur: '#002157',
    couleurTexte: '#ffffff',
    type: 'classique',
    bagages: {
      bagage_personnel: { dimensions: '40×30×15 cm', inclus: true },
      cabine: { poids: '12 kg', dimensions: '55×35×25 cm', inclus: true },
      soute: { poids: '23 kg', inclus: true, prix_aprox: 'Inclus en Economy Flex' },
      notes: 'Economy Light : bagage cabine uniquement. Economy Standard et Flex : 1 bagage soute 23 kg inclus.',
    },
  },
  {
    id: 'easyjet',
    nom: 'EasyJet',
    emoji: '',
    couleur: '#FF6600',
    couleurTexte: '#ffffff',
    type: 'low_cost',
    bagages: {
      bagage_personnel: { dimensions: '45×36×20 cm', inclus: true },
      cabine: { poids: '15 kg', dimensions: '56×45×25 cm', inclus: false },
      soute: { poids: '23 kg', inclus: false, prix_aprox: '7–35€ selon la route' },
      notes: 'Le petit bagage personnel est toujours gratuit. Le bagage cabine à main est payant (sauf membres FLEXI ou Plus).',
    },
  },
  {
    id: 'ryanair',
    nom: 'Ryanair',
    emoji: '',
    couleur: '#073590',
    couleurTexte: '#ffffff',
    type: 'low_cost',
    bagages: {
      bagage_personnel: { dimensions: '40×20×25 cm', inclus: true },
      cabine: { poids: '10 kg', dimensions: '55×40×20 cm', inclus: false },
      soute: { poids: '20 kg', inclus: false, prix_aprox: '10–40€ selon la route' },
      notes: 'Le petit bagage sous le siège (40×20×25) est toujours gratuit. Le grand bagage cabine est payant sauf Priority.',
    },
  },
  {
    id: 'transavia',
    nom: 'Transavia',
    emoji: '',
    couleur: '#00A650',
    couleurTexte: '#ffffff',
    type: 'low_cost',
    bagages: {
      bagage_personnel: { dimensions: '40×30×20 cm', inclus: true },
      cabine: { poids: '10 kg', dimensions: '55×35×25 cm', inclus: true },
      soute: { poids: '20 kg', inclus: false, prix_aprox: '12–45€' },
      notes: '1 bagage cabine 10 kg inclus. Bagage soute payant à partir de 12€.',
    },
  },
  {
    id: 'vueling',
    nom: 'Vueling',
    emoji: '',
    couleur: '#FFD000',
    couleurTexte: '#ffffff',
    type: 'low_cost',
    bagages: {
      bagage_personnel: { dimensions: '40×30×20 cm', inclus: true },
      cabine: { poids: '10 kg', dimensions: '55×40×20 cm', inclus: false },
      soute: { poids: '23 kg', inclus: false, prix_aprox: '15–50€' },
      notes: 'Basic : petit bagage sous le siège uniquement. Optima et Family : bagage cabine inclus.',
    },
  },
  {
    id: 'emirates',
    nom: 'Emirates',
    emoji: '',
    couleur: '#C01B28',
    couleurTexte: '#ffffff',
    type: 'long_courrier',
    bagages: {
      bagage_personnel: { dimensions: 'Sac à main ou ordinateur', inclus: true },
      cabine: { poids: '7 kg', dimensions: '55×38×20 cm', inclus: true },
      soute: { poids: '30 kg', inclus: true },
      notes: 'Economy : 30 kg en soute inclus. Business : 40 kg. First : 50 kg. Franchises très généreuses.',
    },
  },
  {
    id: 'qatar-airways',
    nom: 'Qatar Airways',
    emoji: '',
    couleur: '#5C0632',
    couleurTexte: '#ffffff',
    type: 'long_courrier',
    bagages: {
      bagage_personnel: { dimensions: 'Sac à main ou ordinateur', inclus: true },
      cabine: { poids: '7 kg', dimensions: '50×37×25 cm', inclus: true },
      soute: { poids: '30 kg', inclus: true },
      notes: 'Economy : 30 kg en soute. Business : 40 kg. First : 50 kg.',
    },
  },
  {
    id: 'turkish-airlines',
    nom: 'Turkish Airlines',
    emoji: '',
    couleur: '#C8102E',
    couleurTexte: '#ffffff',
    type: 'long_courrier',
    bagages: {
      bagage_personnel: { dimensions: 'Sac à main ou ordinateur', inclus: true },
      cabine: { poids: '8 kg', dimensions: '55×40×23 cm', inclus: true },
      soute: { poids: '30 kg', inclus: true },
      notes: 'Economy : 1 bagage de 30 kg inclus. Économique Flex : 30 kg. Business : 40 kg.',
    },
  },
  {
    id: 'lufthansa',
    nom: 'Lufthansa',
    emoji: '',
    couleur: '#05164D',
    couleurTexte: '#ffffff',
    type: 'classique',
    bagages: {
      bagage_personnel: { dimensions: '40×30×10 cm', inclus: true },
      cabine: { poids: '8 kg', dimensions: '55×40×23 cm', inclus: true },
      soute: { poids: '23 kg', inclus: false, prix_aprox: 'Inclus en tarifs flex' },
      notes: 'Light : cabine uniquement. Classic et Flex : 1 bagage soute 23 kg inclus.',
    },
  },
  {
    id: 'klm',
    nom: 'KLM',
    emoji: '',
    couleur: '#00A1DE',
    couleurTexte: '#ffffff',
    type: 'classique',
    bagages: {
      bagage_personnel: { dimensions: '40×30×15 cm', inclus: true },
      cabine: { poids: '12 kg', dimensions: '55×35×25 cm', inclus: true },
      soute: { poids: '23 kg', inclus: false, prix_aprox: 'Inclus en Light+ et Flex' },
      notes: 'Light : bagage cabine uniquement. Light+ et Flex : 1 bagage soute 23 kg inclus.',
    },
  },
  {
    id: 'british-airways',
    nom: 'British Airways',
    emoji: '',
    couleur: '#075AAA',
    couleurTexte: '#ffffff',
    type: 'classique',
    bagages: {
      bagage_personnel: { dimensions: '40×30×15 cm', inclus: true },
      cabine: { poids: '23 kg', dimensions: '56×45×25 cm', inclus: true },
      soute: { poids: '23 kg', inclus: false, prix_aprox: 'Inclus en tarifs flex' },
      notes: 'Hand Baggage Only : cabine uniquement. Plus et Flex : bagage soute inclus.',
    },
  },
  {
    id: 'tui',
    nom: 'TUI',
    emoji: '',
    couleur: '#CC0000',
    couleurTexte: '#ffffff',
    type: 'classique',
    bagages: {
      bagage_personnel: { dimensions: '45×36×20 cm', inclus: true },
      cabine: { poids: '10 kg', dimensions: '55×40×23 cm', inclus: true },
      soute: { poids: '20 kg', inclus: true },
      notes: '1 bagage soute 20 kg inclus selon le forfait. Vérifier avec ton voyagiste.',
    },
  },
]
