export type Statut = 'inclus' | 'payant' | 'non_autorise'

export type BagageData = {
  dimensions: string
  poids: string
  statut: Statut
  prix: number | null
}

export type Billet = {
  sous_siege: BagageData
  cabine: BagageData
  soute: BagageData
}

export type RegleCompagnie = {
  lien_officiel: string
  date_maj: string
  pas_de_distinction?: boolean
  billets: {
    basic: Billet
    standard: Billet
    flex: Billet
  }
}

export const reglesBagages: Record<string, RegleCompagnie> = {
  air_france: {
    lien_officiel: 'https://wwws.airfrance.fr/information/bagages/bagage-cabine-soute',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: '40×30×15 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×35×25 cm', poids: '12 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                statut: 'payant', prix: 30 },
      },
      standard: {
        sous_siege: { dimensions: '40×30×15 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×35×25 cm', poids: '12 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                statut: 'inclus', prix: null },
      },
      flex: {
        sous_siege: { dimensions: '40×30×15 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×35×25 cm', poids: '12 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                statut: 'inclus', prix: null },
      },
    },
  },
  easyjet: {
    lien_officiel: 'https://www.easyjet.com/fr/bagages',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: '45×36×20 cm', poids: '15 kg max', statut: 'inclus', prix: null },
        cabine:     { dimensions: '56×45×25 cm', poids: '15 kg max', statut: 'payant', prix: 8 },
        soute:      { dimensions: '275 cm cumulés', poids: '23 kg',  statut: 'payant', prix: 13 },
      },
      standard: {
        sous_siege: { dimensions: '45×36×20 cm', poids: '15 kg max', statut: 'inclus', prix: null },
        cabine:     { dimensions: '56×45×25 cm', poids: '15 kg max', statut: 'inclus', prix: null },
        soute:      { dimensions: '275 cm cumulés', poids: '23 kg',  statut: 'payant', prix: 13 },
      },
      flex: {
        sous_siege: { dimensions: '45×36×20 cm', poids: '15 kg max', statut: 'inclus', prix: null },
        cabine:     { dimensions: '56×45×25 cm', poids: '15 kg max', statut: 'inclus', prix: null },
        soute:      { dimensions: '275 cm cumulés', poids: '23 kg',  statut: 'inclus', prix: null },
      },
    },
  },
  ryanair: {
    lien_officiel: 'https://www.ryanair.com/fr/fr/informations-utiles/aide-aux-passagers/politique-bagages',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: '40×30×20 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×20 cm', poids: '10 kg max',               statut: 'payant', prix: 6 },
        soute:      { dimensions: 'Standard',    poids: '20 kg',                   statut: 'payant', prix: 12 },
      },
      standard: {
        sous_siege: { dimensions: '40×30×20 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×20 cm', poids: '10 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: 'Standard',    poids: '20 kg',                   statut: 'payant', prix: 12 },
      },
      flex: {
        sous_siege: { dimensions: '40×30×20 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×20 cm', poids: '10 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: 'Standard',    poids: '20 kg',                   statut: 'inclus', prix: null },
      },
    },
  },
  transavia: {
    lien_officiel: 'https://www.transavia.com/fr-FR/service-et-bagages/bagages',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: '40×30×20 cm', poids: '10 kg max (total cabine)', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×25 cm', poids: '10 kg max (total cabine)', statut: 'payant', prix: 20 },
        soute:      { dimensions: '158 cm cumulés', poids: '20 kg',                 statut: 'payant', prix: 20 },
      },
      standard: {
        sous_siege: { dimensions: '40×30×20 cm', poids: '10 kg max (total cabine)', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×25 cm', poids: '10 kg max (total cabine)', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '20 kg',                 statut: 'inclus', prix: null },
      },
      flex: {
        sous_siege: { dimensions: '40×30×20 cm', poids: '10 kg max (total cabine)', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×25 cm', poids: '10 kg max (total cabine)', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '20 kg',                 statut: 'inclus', prix: null },
      },
    },
  },
  vueling: {
    lien_officiel: 'https://www.vueling.com/fr/services-vueling/preparez-votre-vol/bagages',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: '40×30×20 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×20 cm', poids: '10 kg max',               statut: 'payant', prix: 10 },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                statut: 'payant', prix: 20 },
      },
      standard: {
        sous_siege: { dimensions: '40×30×20 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×20 cm', poids: '10 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                statut: 'payant', prix: 20 },
      },
      flex: {
        sous_siege: { dimensions: '40×30×20 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×20 cm', poids: '10 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                statut: 'inclus', prix: null },
      },
    },
  },
  emirates: {
    lien_officiel: 'https://www.emirates.com/fr/french/help/faq-topics/baggage-and-lost-property/faq/what-is-my-allowance-for-cabin-baggage/',
    date_maj: '6 juillet 2026',
    pas_de_distinction: true,
    billets: {
      basic: {
        sous_siege: { dimensions: '-',           poids: '-',        statut: 'non_autorise', prix: null },
        cabine:     { dimensions: '55×38×22 cm', poids: '7 kg max', statut: 'inclus',       prix: null },
        soute:      { dimensions: '150 cm cumulés', poids: '30 kg', statut: 'inclus',       prix: null },
      },
      standard: {
        sous_siege: { dimensions: '-',           poids: '-',        statut: 'non_autorise', prix: null },
        cabine:     { dimensions: '55×38×22 cm', poids: '7 kg max', statut: 'inclus',       prix: null },
        soute:      { dimensions: '150 cm cumulés', poids: '30 kg', statut: 'inclus',       prix: null },
      },
      flex: {
        sous_siege: { dimensions: '-',           poids: '-',        statut: 'non_autorise', prix: null },
        cabine:     { dimensions: '55×38×22 cm', poids: '7 kg max', statut: 'inclus',       prix: null },
        soute:      { dimensions: '150 cm cumulés', poids: '30 kg', statut: 'inclus',       prix: null },
      },
    },
  },
  turkish: {
    lien_officiel: 'https://www.turkishairlines.com/fr-fr/any-questions/baggage-information',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: '40×30×15 cm', poids: '4 kg max', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×23 cm', poids: '8 kg max', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '20 kg', statut: 'inclus', prix: null },
      },
      standard: {
        sous_siege: { dimensions: '40×30×15 cm', poids: '4 kg max', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×23 cm', poids: '8 kg max', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg', statut: 'inclus', prix: null },
      },
      flex: {
        sous_siege: { dimensions: '40×30×15 cm', poids: '4 kg max', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×23 cm', poids: '8 kg max', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '30 kg', statut: 'inclus', prix: null },
      },
    },
  },
  qatar: {
    lien_officiel: 'https://www.qatarairways.com/fr-fr/baggage/allowance.html',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: 'Non spécifiées', poids: 'Inclus dans 7 kg', statut: 'inclus', prix: null },
        cabine:     { dimensions: '50×37×25 cm',    poids: '7 kg max',         statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',            statut: 'inclus', prix: null },
      },
      standard: {
        sous_siege: { dimensions: 'Non spécifiées', poids: 'Inclus dans 7 kg', statut: 'inclus', prix: null },
        cabine:     { dimensions: '50×37×25 cm',    poids: '7 kg max',         statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '30 kg',            statut: 'inclus', prix: null },
      },
      flex: {
        sous_siege: { dimensions: 'Non spécifiées', poids: 'Inclus dans 7 kg', statut: 'inclus', prix: null },
        cabine:     { dimensions: '50×37×25 cm',    poids: '7 kg max',         statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '30 kg',            statut: 'inclus', prix: null },
      },
    },
  },
  lufthansa: {
    lien_officiel: 'https://www.lufthansa.com/fr/fr/bagages',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: '40×30×10 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×23 cm', poids: '8 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',               statut: 'payant', prix: 30 },
      },
      standard: {
        sous_siege: { dimensions: '40×30×10 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×23 cm', poids: '8 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',               statut: 'inclus', prix: null },
      },
      flex: {
        sous_siege: { dimensions: '40×30×10 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×40×23 cm', poids: '8 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',               statut: 'inclus', prix: null },
      },
    },
  },
  klm: {
    lien_officiel: 'https://www.klm.com/fr/fr/information/bagages',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: '40×30×15 cm', poids: '12 kg max (total cabine)', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×35×25 cm', poids: '12 kg max (total cabine)', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                 statut: 'payant', prix: 25 },
      },
      standard: {
        sous_siege: { dimensions: '40×30×15 cm', poids: '12 kg max (total cabine)', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×35×25 cm', poids: '12 kg max (total cabine)', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                 statut: 'inclus', prix: null },
      },
      flex: {
        sous_siege: { dimensions: '40×30×15 cm', poids: '12 kg max (total cabine)', statut: 'inclus', prix: null },
        cabine:     { dimensions: '55×35×25 cm', poids: '12 kg max (total cabine)', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                 statut: 'inclus', prix: null },
      },
    },
  },
  british: {
    lien_officiel: 'https://www.britishairways.com/fr-fr/information/baggage-essentials/hand-baggage-allowances',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: '40×30×15 cm', poids: '23 kg max (combiné)', statut: 'inclus', prix: null },
        cabine:     { dimensions: '56×45×25 cm', poids: '23 kg max (combiné)', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',            statut: 'payant', prix: 35 },
      },
      standard: {
        sous_siege: { dimensions: '40×30×15 cm', poids: '23 kg max (combiné)', statut: 'inclus', prix: null },
        cabine:     { dimensions: '56×45×25 cm', poids: '23 kg max (combiné)', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',            statut: 'inclus', prix: null },
      },
      flex: {
        sous_siege: { dimensions: '40×30×15 cm', poids: '23 kg max (combiné)', statut: 'inclus', prix: null },
        cabine:     { dimensions: '56×45×25 cm', poids: '23 kg max (combiné)', statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',            statut: 'inclus', prix: null },
      },
    },
  },
  iberia: {
    lien_officiel: 'https://www.iberia.com/fr/information/bagages',
    date_maj: '6 juillet 2026',
    billets: {
      basic: {
        sous_siege: { dimensions: '40×30×15 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '56×40×25 cm', poids: '10 kg max',               statut: 'payant', prix: 12 },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                statut: 'payant', prix: 25 },
      },
      standard: {
        sous_siege: { dimensions: '40×30×15 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '56×40×25 cm', poids: '10 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                statut: 'payant', prix: 25 },
      },
      flex: {
        sous_siege: { dimensions: '40×30×15 cm', poids: 'Pas de limite officielle', statut: 'inclus', prix: null },
        cabine:     { dimensions: '56×40×25 cm', poids: '10 kg max',               statut: 'inclus', prix: null },
        soute:      { dimensions: '158 cm cumulés', poids: '23 kg',                statut: 'inclus', prix: null },
      },
    },
  },
}
