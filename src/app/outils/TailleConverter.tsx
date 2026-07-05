'use client'

import { useState, useMemo } from 'react'
import type { PaysOutil } from './NumerosUrgence'

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
  { fr: 34, us: 'XS / 0',  uk: '6',  it: '38', jp: 'XS',  au: '6',  kr: '44'  },
  { fr: 36, us: 'S / 2',   uk: '8',  it: '40', jp: 'S',   au: '8',  kr: '55'  },
  { fr: 38, us: 'M / 4-6', uk: '10', it: '42', jp: 'M',   au: '10', kr: '66'  },
  { fr: 40, us: 'L / 8',   uk: '12', it: '44', jp: 'L',   au: '12', kr: '77'  },
  { fr: 42, us: 'XL / 10', uk: '14', it: '46', jp: 'XL',  au: '14', kr: '88'  },
  { fr: 44, us: 'XXL / 12',uk: '16', it: '48', jp: 'XXL', au: '16', kr: '99'  },
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

// Mapping code ISO → système de tailles
type SysKey = 'us' | 'uk' | 'it' | 'jp' | 'au' | 'kr' | 'eu'

const CODE_TO_SYSTEM: Record<string, SysKey> = {
  // Système US
  US: 'us', CA: 'us', MX: 'us', AE: 'us', SA: 'us', QA: 'us', KW: 'us', BH: 'us', OM: 'us',
  // Système UK
  GB: 'uk', IN: 'uk', ZA: 'uk', NG: 'uk', SG: 'uk', MY: 'uk', PK: 'uk', BD: 'uk', LK: 'uk',
  // Système Italie (vêtements femme)
  IT: 'it',
  // Japon
  JP: 'jp',
  // Corée / Chine
  KR: 'kr', CN: 'kr', TW: 'kr', HK: 'kr',
  // Australie
  AU: 'au', NZ: 'au',
  // EU (mêmes qu'en France)
  DE: 'eu', ES: 'eu', PT: 'eu', BE: 'eu', NL: 'eu', PL: 'eu', CZ: 'eu', HU: 'eu',
  RO: 'eu', BG: 'eu', AT: 'eu', CH: 'eu', SE: 'eu', NO: 'eu', DK: 'eu', FI: 'eu',
  GR: 'eu', HR: 'eu', SK: 'eu', SI: 'eu', LT: 'eu', LV: 'eu', EE: 'eu', LU: 'eu',
  IE: 'eu', CY: 'eu', MT: 'eu', IS: 'eu', TR: 'eu', MA: 'eu', TN: 'eu', DZ: 'eu',
  EG: 'eu', BR: 'eu', AR: 'eu', CL: 'eu', CO: 'eu', PE: 'eu', VE: 'eu', EC: 'eu',
  TH: 'eu', VN: 'eu', ID: 'eu', PH: 'eu', KH: 'eu', MM: 'eu', LA: 'eu',
  IL: 'eu', JO: 'eu', LB: 'eu', AM: 'eu', GE: 'eu', AZ: 'eu', RS: 'eu', BA: 'eu',
  ME: 'eu', MK: 'eu', AL: 'eu', UA: 'eu', MD: 'eu', KZ: 'eu', UZ: 'eu', MN: 'eu',
  SN: 'eu', CI: 'eu', CM: 'eu', KE: 'eu', ET: 'eu', TZ: 'eu', RW: 'eu', GH: 'eu',
  MU: 'eu', MG: 'eu', SC: 'eu', CV: 'eu',
}

const SYS_LABELS: Record<SysKey, string> = {
  us: 'États-Unis / Canada',
  uk: 'Royaume-Uni / Inde',
  it: 'Italie',
  jp: 'Japon',
  au: 'Australie / NZ',
  kr: 'Corée / Chine',
  eu: 'Europe (= FR)',
}

type Category = 'vetements_f' | 'vetements_h' | 'chaussures_f' | 'chaussures_h'

const CATS: { key: Category; label: string }[] = [
  { key: 'vetements_f',  label: 'Vêtements femme' },
  { key: 'vetements_h',  label: 'Vêtements homme' },
  { key: 'chaussures_f', label: 'Chaussures femme' },
  { key: 'chaussures_h', label: 'Chaussures homme' },
]

export default function TailleConverter({ pays }: { pays: PaysOutil[] }) {
  const [cat, setCat]       = useState<Category>('vetements_f')
  const [search, setSearch] = useState('')
  const [showList, setShowList] = useState(false)
  const [paysCode, setPaysCode] = useState<string | null>(null)

  const isShoes      = cat === 'chaussures_f' || cat === 'chaussures_h'
  const isWomenClothes = cat === 'vetements_f'

  const paysFiltered = useMemo(() => {
    if (!search.trim()) return []
    return pays.filter(p => p.nom_fr.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
  }, [search, pays])

  function handleSelect(p: PaysOutil) {
    setPaysCode(p.code)
    setSearch(p.nom_fr)
    setShowList(false)
  }

  const selectedPays = paysCode ? pays.find(p => p.code === paysCode) : null
  const sys = paysCode ? CODE_TO_SYSTEM[paysCode] ?? null : null

  // Italie uniquement pour vêtements femme
  const effectiveSys: SysKey | null = (sys === 'it' && !isWomenClothes) ? 'eu' : sys

  const rows =
    cat === 'vetements_f'  ? VETEMENTS_FEMME  :
    cat === 'vetements_h'  ? VETEMENTS_HOMME  :
    cat === 'chaussures_f' ? CHAUSSURES_FEMME :
    CHAUSSURES_HOMME

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

      {/* Sélecteur de pays */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Destination</p>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowList(e.target.value.length > 0); setPaysCode(null) }}
          onBlur={() => setTimeout(() => setShowList(false), 150)}
          placeholder="Rechercher un pays..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
        />
        {showList && paysFiltered.length > 0 && (
          <div className="w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            {paysFiltered.map(p => (
              <button key={p.code} type="button"
                onMouseDown={() => handleSelect(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0">
                <span className="text-xl">{p.emoji}</span>
                <span className="text-gray-800">{p.nom_fr}</span>
                {paysCode === p.code && <span className="ml-auto text-[#36A6B2]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {effectiveSys === 'eu' ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-gray-500">
              {selectedPays?.emoji} {selectedPays?.nom_fr} utilise les tailles européennes.
            </p>
            <p className="text-xs text-gray-400 mt-1">Tes tailles françaises sont directement valables.</p>
          </div>
        ) : effectiveSys ? (
          // Mode pays sélectionné → FR + pays
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2.5 px-4 text-left text-xs font-bold text-gray-500">
                  {isShoes ? 'Pointure FR' : 'Taille FR'}
                </th>
                {!isShoes && cat === 'vetements_h' && (
                  <th className="py-2.5 px-3 text-center text-xs font-bold text-gray-400">Poitrine</th>
                )}
                <th className="py-2.5 px-4 text-center text-xs font-bold" style={{ color: '#36A6B2' }}>
                  {selectedPays?.emoji} {SYS_LABELS[effectiveSys]}
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
                    {(r as Record<string, string | number>)[effectiveSys] ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Aucun pays — tableau complet
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

      {effectiveSys === 'jp' && cat === 'vetements_h' && (
        <p className="text-xs text-gray-400 italic text-center">
          Les tailles japonaises tendent à être plus petites — comptez une taille au-dessus.
        </p>
      )}
    </div>
  )
}
