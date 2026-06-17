// Table de correspondance destination (texte libre) -> code pays ISO,
// utilisée en repli quand pays_code n'est pas renseigné (anciens voyages).
export const DESTINATION_TO_CODE: Record<string, string> = {
  maroc: 'MA', morocco: 'MA',
  japon: 'JP', japan: 'JP',
  'thaïlande': 'TH', thailande: 'TH', thailand: 'TH',
  portugal: 'PT',
  'grèce': 'GR', grece: 'GR', greece: 'GR',
  'états-unis': 'US', 'etats-unis': 'US', usa: 'US', 'united states': 'US',
  bali: 'ID', 'indonésie': 'ID', indonesie: 'ID', indonesia: 'ID',
  mexique: 'MX', mexico: 'MX',
  italie: 'IT', italy: 'IT',
  'sénégal': 'SN', senegal: 'SN',
}

export function getPaysCode(paysCode: string | null, destination: string): string | null {
  if (paysCode) return paysCode
  const key = destination.toLowerCase().trim()
  for (const [pattern, code] of Object.entries(DESTINATION_TO_CODE)) {
    if (key.includes(pattern)) return code
  }
  return null
}

// Correspondance code pays -> slug Ariane (diplomatie.gouv.fr)
export const CODE_TO_ARIANE_SLUG: Record<string, string> = {
  MA: 'maroc', JP: 'japon', TH: 'thailande', PT: 'portugal',
  GR: 'grece', US: 'etats-unis', ID: 'indonesie', MX: 'mexique',
  IT: 'italie', SN: 'senegal',
}

export function getArianeUrl(paysCode: string | null): string {
  const slug = paysCode ? CODE_TO_ARIANE_SLUG[paysCode] : null
  return slug
    ? `https://www.diplomatie.gouv.fr/fr/information-par-pays/${slug}/conseils-aux-voyageurs-securite`
    : 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/'
}
