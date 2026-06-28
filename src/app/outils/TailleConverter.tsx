'use client'

import { useState } from 'react'

const CHAUSSURES_HOMME = [
  { eu: 39, uk: '6',    us: '7'    },
  { eu: 40, uk: '6.5', us: '7.5'  },
  { eu: 41, uk: '7',   us: '8'    },
  { eu: 42, uk: '8',   us: '9'    },
  { eu: 43, uk: '9',   us: '10'   },
  { eu: 44, uk: '9.5', us: '10.5' },
  { eu: 45, uk: '10.5',us: '11.5' },
  { eu: 46, uk: '11',  us: '12'   },
  { eu: 47, uk: '12',  us: '13'   },
]

const CHAUSSURES_FEMME = [
  { eu: 35, uk: '2.5', us: '5'    },
  { eu: 36, uk: '3.5', us: '6'    },
  { eu: 37, uk: '4',   us: '6.5'  },
  { eu: 38, uk: '5',   us: '7.5'  },
  { eu: 39, uk: '5.5', us: '8'    },
  { eu: 40, uk: '6.5', us: '9'    },
  { eu: 41, uk: '7.5', us: '10'   },
  { eu: 42, uk: '8.5', us: '11'   },
]

const VETEMENTS_FEMME = [
  { eu: 34, uk: '6',  us: 'XS / 0',  it: '38' },
  { eu: 36, uk: '8',  us: 'S / 2',   it: '40' },
  { eu: 38, uk: '10', us: 'M / 4-6', it: '42' },
  { eu: 40, uk: '12', us: 'L / 8',   it: '44' },
  { eu: 42, uk: '14', us: 'XL / 10', it: '46' },
  { eu: 44, uk: '16', us: 'XXL / 12',it: '48' },
  { eu: 46, uk: '18', us: '3XL / 14',it: '50' },
]

const VETEMENTS_HOMME = [
  { eu: 'XS', chest: '82-86 cm',  uk: 'XS', us: 'XS' },
  { eu: 'S',  chest: '87-91 cm',  uk: 'S',  us: 'S'  },
  { eu: 'M',  chest: '92-96 cm',  uk: 'M',  us: 'M'  },
  { eu: 'L',  chest: '97-101 cm', uk: 'L',  us: 'L'  },
  { eu: 'XL', chest: '102-107 cm',uk: 'XL', us: 'XL' },
  { eu: 'XXL',chest: '108-113 cm',uk: 'XXL',us: 'XXL'},
]

type Category = 'chaussures_h' | 'chaussures_f' | 'vetements_f' | 'vetements_h'

const CATS: { key: Category; label: string; emoji: string }[] = [
  { key: 'chaussures_h', label: 'Chaussures homme', emoji: '👞' },
  { key: 'chaussures_f', label: 'Chaussures femme', emoji: '👠' },
  { key: 'vetements_f',  label: 'Vêtements femme',  emoji: '👗' },
  { key: 'vetements_h',  label: 'Vêtements homme',  emoji: '👕' },
]

export default function TailleConverter() {
  const [cat, setCat] = useState<Category>('chaussures_h')

  const rows = cat === 'chaussures_h' ? CHAUSSURES_HOMME
    : cat === 'chaussures_f' ? CHAUSSURES_FEMME
    : cat === 'vetements_f'  ? VETEMENTS_FEMME
    : VETEMENTS_HOMME

  return (
    <div className="flex flex-col gap-4">
      {/* Catégories */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATS.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: cat === c.key ? '#1D4ED8' : '#F3F4F6',
              color: cat === c.key ? 'white' : '#6B7280',
            }}>
            <span>{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {cat === 'chaussures_h' || cat === 'chaussures_f' ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2.5 px-3 text-left text-xs font-bold text-gray-500">EU</th>
                <th className="py-2.5 px-3 text-center text-xs font-bold text-gray-500">UK</th>
                <th className="py-2.5 px-3 text-center text-xs font-bold text-gray-500">US</th>
              </tr>
            </thead>
            <tbody>
              {(rows as typeof CHAUSSURES_HOMME).map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2.5 px-3 font-bold text-gray-800">{r.eu}</td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{r.uk}</td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{r.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : cat === 'vetements_f' ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2.5 px-3 text-left text-xs font-bold text-gray-500">EU / FR</th>
                <th className="py-2.5 px-3 text-center text-xs font-bold text-gray-500">UK</th>
                <th className="py-2.5 px-3 text-center text-xs font-bold text-gray-500">US</th>
                <th className="py-2.5 px-3 text-center text-xs font-bold text-gray-500">IT</th>
              </tr>
            </thead>
            <tbody>
              {(rows as typeof VETEMENTS_FEMME).map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2.5 px-3 font-bold text-gray-800">{r.eu}</td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{r.uk}</td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{r.us}</td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{r.it}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2.5 px-3 text-left text-xs font-bold text-gray-500">Taille EU</th>
                <th className="py-2.5 px-3 text-center text-xs font-bold text-gray-500">Tour de poitrine</th>
                <th className="py-2.5 px-3 text-center text-xs font-bold text-gray-500">UK / US</th>
              </tr>
            </thead>
            <tbody>
              {(rows as typeof VETEMENTS_HOMME).map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2.5 px-3 font-bold text-gray-800">{r.eu}</td>
                  <td className="py-2.5 px-3 text-center text-gray-500 text-xs">{r.chest}</td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{r.uk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
