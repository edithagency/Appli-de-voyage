'use client'

import { useState } from 'react'

// --- Données ---

const CHAUSSURES_FEMME = [
  { fr: 35, us: '5',    uk: '2.5', jp: '22',   au: '4',   kr: '220' },
  { fr: 36, us: '6',    uk: '3.5', jp: '23',   au: '5',   kr: '230' },
  { fr: 37, us: '6.5', uk: '4',   jp: '23.5', au: '6',   kr: '235' },
  { fr: 38, us: '7.5', uk: '5',   jp: '24',   au: '7',   kr: '240' },
  { fr: 39, us: '8',   uk: '5.5', jp: '24.5', au: '8',   kr: '245' },
  { fr: 40, us: '9',   uk: '6.5', jp: '25',   au: '9',   kr: '250' },
  { fr: 41, us: '10',  uk: '7.5', jp: '25.5', au: '10',  kr: '255' },
  { fr: 42, us: '11',  uk: '8.5', jp: '26',   au: '11',  kr: '260' },
]

const CHAUSSURES_HOMME = [
  { fr: 39, us: '7',    uk: '6',    jp: '24.5', au: '6',    kr: '245' },
  { fr: 40, us: '7.5', uk: '6.5', jp: '25',   au: '6.5', kr: '250' },
  { fr: 41, us: '8',   uk: '7',   jp: '26',   au: '7',   kr: '260' },
  { fr: 42, us: '9',   uk: '8',   jp: '26.5', au: '8',   kr: '265' },
  { fr: 43, us: '10',  uk: '9',   jp: '27',   au: '9',   kr: '270' },
  { fr: 44, us: '10.5',uk: '9.5', jp: '27.5', au: '9.5', kr: '275' },
  { fr: 45, us: '11.5',uk: '10.5',jp: '28',   au: '10.5',kr: '280' },
  { fr: 46, us: '12',  uk: '11',  jp: '29',   au: '11',  kr: '290' },
  { fr: 47, us: '13',  uk: '12',  jp: '30',   au: '12',  kr: '300' },
]

const VETEMENTS_FEMME = [
  { fr: 34, us: 'XS / 0',  uk: '6',  it: '38', jp: 'XS',  au: '6',  kr: '44' },
  { fr: 36, us: 'S / 2',   uk: '8',  it: '40', jp: 'S',   au: '8',  kr: '55' },
  { fr: 38, us: 'M / 4-6', uk: '10', it: '42', jp: 'M',   au: '10', kr: '66' },
  { fr: 40, us: 'L / 8',   uk: '12', it: '44', jp: 'L',   au: '12', kr: '77' },
  { fr: 42, us: 'XL / 10', uk: '14', it: '46', jp: 'XL',  au: '14', kr: '88' },
  { fr: 44, us: 'XXL / 12',uk: '16', it: '48', jp: 'XXL', au: '16', kr: '99' },
  { fr: 46, us: '3XL / 14',uk: '18', it: '50', jp: '3XL', au: '18', kr: '110' },
]

const VETEMENTS_HOMME = [
  { fr: 'XS',  chest: '82–86 cm',  us: 'XS',  uk: 'XS',  jp: 'S',   au: 'XS',  kr: 'S'   },
  { fr: 'S',   chest: '87–91 cm',  us: 'S',   uk: 'S',   jp: 'M',   au: 'S',   kr: 'M'   },
  { fr: 'M',   chest: '92–96 cm',  us: 'M',   uk: 'M',   jp: 'L',   au: 'M',   kr: 'L'   },
  { fr: 'L',   chest: '97–101 cm', us: 'L',   uk: 'L',   jp: 'XL',  au: 'L',   kr: 'XL'  },
  { fr: 'XL',  chest: '102–107 cm',us: 'XL',  uk: 'XL',  jp: 'XXL', au: 'XL',  kr: 'XXL' },
  { fr: 'XXL', chest: '108–113 cm',us: 'XXL', uk: 'XXL', jp: '3XL', au: 'XXL', kr: '3XL' },
]

// --- Config ---

type Category = 'vetements_f' | 'vetements_h' | 'chaussures_f' | 'chaussures_h'

const CATS: { key: Category; label: string }[] = [
  { key: 'vetements_f',  label: 'Vêtements femme' },
  { key: 'vetements_h',  label: 'Vêtements homme' },
  { key: 'chaussures_f', label: 'Chaussures femme' },
  { key: 'chaussures_h', label: 'Chaussures homme' },
]

type CountryKey = 'us' | 'uk' | 'it' | 'jp' | 'au' | 'kr'

const COUNTRIES: { key: CountryKey; label: string; emoji: string; noClothes?: boolean }[] = [
  { key: 'us', label: 'États-Unis', emoji: '🇺🇸' },
  { key: 'uk', label: 'Royaume-Uni', emoji: '🇬🇧' },
  { key: 'it', label: 'Italie', emoji: '🇮🇹' },
  { key: 'jp', label: 'Japon', emoji: '🇯🇵' },
  { key: 'au', label: 'Australie', emoji: '🇦🇺' },
  { key: 'kr', label: 'Corée / Chine', emoji: '🇰🇷' },
]

export default function TailleConverter() {
  const [cat, setCat]     = useState<Category>('vetements_f')
  const [pays, setPays]   = useState<CountryKey | null>(null)

  const isShoes    = cat === 'chaussures_f' || cat === 'chaussures_h'
  const isWomenClothes = cat === 'vetements_f'

  // Italie uniquement pour vêtements femme
  const availableCountries = COUNTRIES.filter(c => !(c.key === 'it' && !isWomenClothes))

  const rows =
    cat === 'vetements_f'  ? VETEMENTS_FEMME  :
    cat === 'vetements_h'  ? VETEMENTS_HOMME  :
    cat === 'chaussures_f' ? CHAUSSURES_FEMME :
    CHAUSSURES_HOMME

  // Si pays sélectionné absent des pays dispo, reset
  const effectivePays = pays && availableCountries.find(c => c.key === pays) ? pays : null

  const selectedCountry = effectivePays ? COUNTRIES.find(c => c.key === effectivePays) : null

  return (
    <div className="flex flex-col gap-4">
      {/* Onglets catégorie */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATS.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)}
            className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: cat === c.key ? '#004850' : '#F3F4F6',
              color: cat === c.key ? 'white' : '#6B7280',
            }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Chips pays */}
      <div className="flex flex-wrap gap-2">
        {availableCountries.map(c => (
          <button key={c.key}
            onClick={() => setPays(effectivePays === c.key ? null : c.key)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
            style={{
              background:  effectivePays === c.key ? '#36A6B2' : '#F9FAFB',
              color:       effectivePays === c.key ? 'white'   : '#6B7280',
              borderColor: effectivePays === c.key ? '#36A6B2' : '#E5E7EB',
            }}>
            <span>{c.emoji}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {effectivePays ? (
          // Mode pays sélectionné : FR → Pays
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2.5 px-4 text-left text-xs font-bold text-gray-500">
                  {isShoes ? 'Pointure FR' : 'Taille FR'}
                </th>
                {!isShoes && cat === 'vetements_h' && (
                  <th className="py-2.5 px-3 text-center text-xs font-bold text-gray-400">Tour de poitrine</th>
                )}
                <th className="py-2.5 px-4 text-center text-xs font-bold" style={{ color: '#36A6B2' }}>
                  {selectedCountry?.emoji} {selectedCountry?.label}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2.5 px-4 font-bold text-gray-800">{r.fr}</td>
                  {!isShoes && cat === 'vetements_h' && (
                    <td className="py-2.5 px-3 text-center text-gray-400 text-xs">
                      {(r as typeof VETEMENTS_HOMME[0]).chest}
                    </td>
                  )}
                  <td className="py-2.5 px-4 text-center font-semibold" style={{ color: '#004850' }}>
                    {(r as Record<string, string | number>)[effectivePays] ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Mode tout afficher
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2.5 px-3 text-left text-xs font-bold text-gray-500">FR</th>
                {!isShoes && cat === 'vetements_h' && (
                  <th className="py-2.5 px-2 text-center text-xs font-bold text-gray-400">Poitrine</th>
                )}
                <th className="py-2.5 px-2 text-center text-xs font-bold text-gray-500">🇺🇸 US</th>
                <th className="py-2.5 px-2 text-center text-xs font-bold text-gray-500">🇬🇧 UK</th>
                {isWomenClothes && <th className="py-2.5 px-2 text-center text-xs font-bold text-gray-500">🇮🇹 IT</th>}
                <th className="py-2.5 px-2 text-center text-xs font-bold text-gray-500">🇯🇵 JP</th>
                <th className="py-2.5 px-2 text-center text-xs font-bold text-gray-500">🇦🇺 AU</th>
                <th className="py-2.5 px-2 text-center text-xs font-bold text-gray-500">🇰🇷 KR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-3 font-bold text-gray-800">{r.fr}</td>
                  {!isShoes && cat === 'vetements_h' && (
                    <td className="py-2 px-2 text-center text-gray-400 text-xs">
                      {(r as typeof VETEMENTS_HOMME[0]).chest}
                    </td>
                  )}
                  <td className="py-2 px-2 text-center text-gray-600 text-xs">{(r as Record<string, string | number>).us}</td>
                  <td className="py-2 px-2 text-center text-gray-600 text-xs">{(r as Record<string, string | number>).uk}</td>
                  {isWomenClothes && <td className="py-2 px-2 text-center text-gray-600 text-xs">{(r as typeof VETEMENTS_FEMME[0]).it}</td>}
                  <td className="py-2 px-2 text-center text-gray-600 text-xs">{(r as Record<string, string | number>).jp}</td>
                  <td className="py-2 px-2 text-center text-gray-600 text-xs">{(r as Record<string, string | number>).au}</td>
                  <td className="py-2 px-2 text-center text-gray-600 text-xs">{(r as Record<string, string | number>).kr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {cat === 'vetements_h' && (
        <p className="text-xs text-gray-400 italic text-center">
          Les tailles japonaises et coréennes tendent à être plus petites — comptez une taille au-dessus.
        </p>
      )}
    </div>
  )
}
