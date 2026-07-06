'use client'

import { useEffect, useState } from 'react'

const VILLES = [
  // Europe occidentale
  { label: 'Paris',          tz: 'Europe/Paris' },
  { label: 'Londres',        tz: 'Europe/London' },
  { label: 'Édimbourg',      tz: 'Europe/London' },
  { label: 'Lisbonne',       tz: 'Europe/Lisbon' },
  { label: 'Porto',          tz: 'Europe/Lisbon' },
  { label: 'Madrid',         tz: 'Europe/Madrid' },
  { label: 'Barcelone',      tz: 'Europe/Madrid' },
  { label: 'Séville',        tz: 'Europe/Madrid' },
  { label: 'Rome',           tz: 'Europe/Rome' },
  { label: 'Milan',          tz: 'Europe/Rome' },
  { label: 'Naples',         tz: 'Europe/Rome' },
  { label: 'Venise',         tz: 'Europe/Rome' },
  { label: 'Amsterdam',      tz: 'Europe/Amsterdam' },
  { label: 'Berlin',         tz: 'Europe/Berlin' },
  { label: 'Munich',         tz: 'Europe/Berlin' },
  { label: 'Hambourg',       tz: 'Europe/Berlin' },
  { label: 'Francfort',      tz: 'Europe/Berlin' },
  { label: 'Prague',         tz: 'Europe/Prague' },
  { label: 'Vienne',         tz: 'Europe/Vienna' },
  { label: 'Zurich',         tz: 'Europe/Zurich' },
  { label: 'Genève',         tz: 'Europe/Zurich' },
  { label: 'Berne',          tz: 'Europe/Zurich' },
  { label: 'Bruxelles',      tz: 'Europe/Brussels' },
  { label: 'Luxembourg',     tz: 'Europe/Luxembourg' },
  { label: 'Stockholm',      tz: 'Europe/Stockholm' },
  { label: 'Göteborg',       tz: 'Europe/Stockholm' },
  { label: 'Oslo',           tz: 'Europe/Oslo' },
  { label: 'Bergen',         tz: 'Europe/Oslo' },
  { label: 'Copenhague',     tz: 'Europe/Copenhagen' },
  { label: 'Helsinki',       tz: 'Europe/Helsinki' },
  { label: 'Dublin',         tz: 'Europe/Dublin' },
  { label: 'Reykjavik',      tz: 'Atlantic/Reykjavik' },
  // Europe centrale & orientale
  { label: 'Varsovie',       tz: 'Europe/Warsaw' },
  { label: 'Cracovie',       tz: 'Europe/Warsaw' },
  { label: 'Budapest',       tz: 'Europe/Budapest' },
  { label: 'Bucarest',       tz: 'Europe/Bucharest' },
  { label: 'Sofia',          tz: 'Europe/Sofia' },
  { label: 'Athènes',        tz: 'Europe/Athens' },
  { label: 'Zagreb',         tz: 'Europe/Zagreb' },
  { label: 'Belgrade',       tz: 'Europe/Belgrade' },
  { label: 'Sarajevo',       tz: 'Europe/Sarajevo' },
  { label: 'Ljubljana',      tz: 'Europe/Ljubljana' },
  { label: 'Tallinn',        tz: 'Europe/Tallinn' },
  { label: 'Riga',           tz: 'Europe/Riga' },
  { label: 'Vilnius',        tz: 'Europe/Vilnius' },
  { label: 'Kiev',           tz: 'Europe/Kiev' },
  { label: 'Minsk',          tz: 'Europe/Minsk' },
  { label: 'Istanbul',       tz: 'Europe/Istanbul' },
  { label: 'Moscou',         tz: 'Europe/Moscow' },
  { label: 'Saint-Pétersbourg', tz: 'Europe/Moscow' },
  // Afrique du Nord
  { label: 'Casablanca',     tz: 'Africa/Casablanca' },
  { label: 'Marrakech',      tz: 'Africa/Casablanca' },
  { label: 'Tunis',          tz: 'Africa/Tunis' },
  { label: 'Alger',          tz: 'Africa/Algiers' },
  { label: 'Tripoli',        tz: 'Africa/Tripoli' },
  { label: 'Le Caire',       tz: 'Africa/Cairo' },
  { label: 'Alexandrie',     tz: 'Africa/Cairo' },
  // Afrique subsaharienne
  { label: 'Dakar',          tz: 'Africa/Dakar' },
  { label: 'Bamako',         tz: 'Africa/Bamako' },
  { label: 'Ouagadougou',    tz: 'Africa/Ouagadougou' },
  { label: 'Abidjan',        tz: 'Africa/Abidjan' },
  { label: 'Accra',          tz: 'Africa/Accra' },
  { label: 'Lomé',           tz: 'Africa/Lome' },
  { label: 'Lagos',          tz: 'Africa/Lagos' },
  { label: 'Douala',         tz: 'Africa/Douala' },
  { label: 'Libreville',     tz: 'Africa/Libreville' },
  { label: 'Nairobi',        tz: 'Africa/Nairobi' },
  { label: 'Addis-Abeba',    tz: 'Africa/Addis_Ababa' },
  { label: 'Kampala',        tz: 'Africa/Kampala' },
  { label: 'Kigali',         tz: 'Africa/Kigali' },
  { label: 'Dar es Salaam',  tz: 'Africa/Dar_es_Salaam' },
  { label: 'Lusaka',         tz: 'Africa/Lusaka' },
  { label: 'Harare',         tz: 'Africa/Harare' },
  { label: 'Johannesburg',   tz: 'Africa/Johannesburg' },
  { label: 'Le Cap',         tz: 'Africa/Johannesburg' },
  { label: 'Antananarivo',   tz: 'Indian/Antananarivo' },
  // Moyen-Orient
  { label: 'Dubaï',          tz: 'Asia/Dubai' },
  { label: 'Abou Dabi',      tz: 'Asia/Dubai' },
  { label: 'Riyad',          tz: 'Asia/Riyadh' },
  { label: 'Djeddah',        tz: 'Asia/Riyadh' },
  { label: 'Doha',           tz: 'Asia/Qatar' },
  { label: 'Koweït',         tz: 'Asia/Kuwait' },
  { label: 'Mascate',        tz: 'Asia/Muscat' },
  { label: 'Bagdad',         tz: 'Asia/Baghdad' },
  { label: 'Amman',          tz: 'Asia/Amman' },
  { label: 'Beyrouth',       tz: 'Asia/Beirut' },
  { label: 'Damas',          tz: 'Asia/Damascus' },
  { label: 'Tel Aviv',       tz: 'Asia/Jerusalem' },
  { label: 'Téhéran',        tz: 'Asia/Tehran' },
  { label: 'Sanaa',          tz: 'Asia/Aden' },
  // Asie centrale & du Sud
  { label: 'Kaboul',         tz: 'Asia/Kabul' },
  { label: 'Karachi',        tz: 'Asia/Karachi' },
  { label: 'Islamabad',      tz: 'Asia/Karachi' },
  { label: 'Lahore',         tz: 'Asia/Karachi' },
  { label: 'Delhi',          tz: 'Asia/Kolkata' },
  { label: 'Mumbai',         tz: 'Asia/Kolkata' },
  { label: 'Bangalore',      tz: 'Asia/Kolkata' },
  { label: 'Chennai',        tz: 'Asia/Kolkata' },
  { label: 'Katmandou',      tz: 'Asia/Kathmandu' },
  { label: 'Dacca',          tz: 'Asia/Dhaka' },
  { label: 'Colombo',        tz: 'Asia/Colombo' },
  { label: 'Tachkent',       tz: 'Asia/Tashkent' },
  { label: 'Almaty',         tz: 'Asia/Almaty' },
  { label: 'Astana',         tz: 'Asia/Almaty' },
  { label: 'Bichkek',        tz: 'Asia/Bishkek' },
  { label: 'Douchanbé',      tz: 'Asia/Dushanbe' },
  { label: 'Achgabat',       tz: 'Asia/Ashgabat' },
  { label: 'Tbilissi',       tz: 'Asia/Tbilisi' },
  { label: 'Bakou',          tz: 'Asia/Baku' },
  { label: 'Erevan',         tz: 'Asia/Yerevan' },
  // Asie du Sud-Est & Est
  { label: 'Bangkok',        tz: 'Asia/Bangkok' },
  { label: 'Hanoï',          tz: 'Asia/Bangkok' },
  { label: 'Ho Chi Minh',    tz: 'Asia/Ho_Chi_Minh' },
  { label: 'Phnom Penh',     tz: 'Asia/Phnom_Penh' },
  { label: 'Vientiane',      tz: 'Asia/Vientiane' },
  { label: 'Yangon',         tz: 'Asia/Yangon' },
  { label: 'Bali',           tz: 'Asia/Makassar' },
  { label: 'Jakarta',        tz: 'Asia/Jakarta' },
  { label: 'Singapour',      tz: 'Asia/Singapore' },
  { label: 'Kuala Lumpur',   tz: 'Asia/Kuala_Lumpur' },
  { label: 'Manille',        tz: 'Asia/Manila' },
  { label: 'Hong Kong',      tz: 'Asia/Hong_Kong' },
  { label: 'Taipei',         tz: 'Asia/Taipei' },
  { label: 'Pékin',          tz: 'Asia/Shanghai' },
  { label: 'Shanghai',       tz: 'Asia/Shanghai' },
  { label: 'Chengdu',        tz: 'Asia/Shanghai' },
  { label: 'Tokyo',          tz: 'Asia/Tokyo' },
  { label: 'Osaka',          tz: 'Asia/Tokyo' },
  { label: 'Kyoto',          tz: 'Asia/Tokyo' },
  { label: 'Séoul',          tz: 'Asia/Seoul' },
  { label: 'Ulaanbaatar',    tz: 'Asia/Ulaanbaatar' },
  // Océanie
  { label: 'Sydney',         tz: 'Australia/Sydney' },
  { label: 'Melbourne',      tz: 'Australia/Melbourne' },
  { label: 'Brisbane',       tz: 'Australia/Brisbane' },
  { label: 'Perth',          tz: 'Australia/Perth' },
  { label: 'Auckland',       tz: 'Pacific/Auckland' },
  { label: 'Christchurch',   tz: 'Pacific/Auckland' },
  { label: 'Nouméa',         tz: 'Pacific/Noumea' },
  { label: 'Papeete',        tz: 'Pacific/Tahiti' },
  { label: 'Fidji',          tz: 'Pacific/Fiji' },
  // Amériques du Nord
  { label: 'New York',       tz: 'America/New_York' },
  { label: 'Miami',          tz: 'America/New_York' },
  { label: 'Washington',     tz: 'America/New_York' },
  { label: 'Boston',         tz: 'America/New_York' },
  { label: 'Toronto',        tz: 'America/Toronto' },
  { label: 'Montréal',       tz: 'America/Toronto' },
  { label: 'Chicago',        tz: 'America/Chicago' },
  { label: 'Dallas',         tz: 'America/Chicago' },
  { label: 'Houston',        tz: 'America/Chicago' },
  { label: 'Denver',         tz: 'America/Denver' },
  { label: 'Phoenix',        tz: 'America/Phoenix' },
  { label: 'Los Angeles',    tz: 'America/Los_Angeles' },
  { label: 'San Francisco',  tz: 'America/Los_Angeles' },
  { label: 'Las Vegas',      tz: 'America/Los_Angeles' },
  { label: 'Seattle',        tz: 'America/Los_Angeles' },
  { label: 'Vancouver',      tz: 'America/Vancouver' },
  // Amérique centrale & Caraïbes
  { label: 'Mexico',         tz: 'America/Mexico_City' },
  { label: 'Cancún',         tz: 'America/Cancun' },
  { label: 'Guatemala',      tz: 'America/Guatemala' },
  { label: 'San José',       tz: 'America/Costa_Rica' },
  { label: 'Panama',         tz: 'America/Panama' },
  { label: 'La Havane',      tz: 'America/Havana' },
  { label: 'Saint-Domingue', tz: 'America/Santo_Domingo' },
  // Amérique du Sud
  { label: 'Bogotá',         tz: 'America/Bogota' },
  { label: 'Quito',          tz: 'America/Guayaquil' },
  { label: 'Lima',           tz: 'America/Lima' },
  { label: 'São Paulo',      tz: 'America/Sao_Paulo' },
  { label: 'Rio de Janeiro', tz: 'America/Sao_Paulo' },
  { label: 'Brasilia',       tz: 'America/Sao_Paulo' },
  { label: 'Santiago',       tz: 'America/Santiago' },
  { label: 'Buenos Aires',   tz: 'America/Argentina/Buenos_Aires' },
  { label: 'Montevideo',     tz: 'America/Montevideo' },
  { label: 'Caracas',        tz: 'America/Caracas' },
  { label: 'Paramaribo',     tz: 'America/Paramaribo' },
  { label: 'Cayenne',        tz: 'America/Cayenne' },
  // France d'outre-mer
  { label: 'Fort-de-France', tz: 'America/Martinique' },
  { label: 'Pointe-à-Pitre', tz: 'America/Guadeloupe' },
  { label: 'La Réunion',     tz: 'Indian/Reunion' },
  { label: 'Mayotte',        tz: 'Indian/Mayotte' },
]

type Ville = typeof VILLES[0]

function matchVille(label: string, q: string): boolean {
  const ql = q.toLowerCase()
  return label.toLowerCase().split(/[\s\-]+/).some(w => w.startsWith(ql))
}

function loadVille(key: string, fallback: Ville): Ville {
  if (typeof window === 'undefined') return fallback
  const tz    = localStorage.getItem(key + '_tz')
  const label = localStorage.getItem(key + '_label')
  return tz && label ? { tz, label } : fallback
}

function saveVille(key: string, v: Ville) {
  localStorage.setItem(key + '_tz',    v.tz)
  localStorage.setItem(key + '_label', v.label)
}

function formatHeure(date: Date, tz: string) {
  return date.toLocaleTimeString('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatJour(date: Date, tz: string) {
  return date.toLocaleDateString('fr-FR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' })
}

function getOffset(date: Date, tz: string): number {
  const u = date.toLocaleString('en-US', { timeZone: 'UTC' })
  const t = date.toLocaleString('en-US', { timeZone: tz })
  return (new Date(t).getTime() - new Date(u).getTime()) / 3600000
}

export default function DecalageHoraire() {
  const [now,   setNow]   = useState(new Date())
  const [city1, setCity1] = useState<Ville>(() => loadVille('horaire_1', { label: 'Paris',   tz: 'Europe/Paris' }))
  const [city2, setCity2] = useState<Ville>(() => loadVille('horaire_2', { label: 'Bangkok', tz: 'Asia/Bangkok' }))

  const [search1, setSearch1] = useState(city1.label)
  const [search2, setSearch2] = useState(city2.label)
  const [showList1, setShowList1] = useState(false)
  const [showList2, setShowList2] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  function select1(v: Ville) {
    setCity1(v); saveVille('horaire_1', v)
    setSearch1(v.label); setShowList1(false)
  }
  function select2(v: Ville) {
    setCity2(v); saveVille('horaire_2', v)
    setSearch2(v.label); setShowList2(false)
  }

  const filtered1 = showList1 && search1.trim()
    ? VILLES.filter(v => matchVille(v.label, search1)).slice(0, 6)
    : []
  const filtered2 = showList2 && search2.trim()
    ? VILLES.filter(v => matchVille(v.label, search2)).slice(0, 6)
    : []

  const diff = getOffset(now, city2.tz) - getOffset(now, city1.tz)
  const diffLabel = diff === 0 ? 'Même fuseau' : diff > 0 ? `+${diff}h` : `${diff}h`
  const diffColor = diff === 0
    ? { bg: '#F3F4F6', text: '#6B7280' }
    : { bg: '#e7f8ce', text: '#2D5A1B' }

  return (
    <div className="flex flex-col gap-4">
      {/* Sélecteurs côte à côte */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ville 1</p>
          <input
            type="text"
            value={search1}
            onFocus={() => { setSearch1(''); setShowList1(false) }}
            onChange={e => { setSearch1(e.target.value); setShowList1(e.target.value.length > 0) }}
            onBlur={() => setTimeout(() => { setShowList1(false); setSearch1(city1.label) }, 150)}
            placeholder="Rechercher…"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ville 2</p>
          <input
            type="text"
            value={search2}
            onFocus={() => { setSearch2(''); setShowList2(false) }}
            onChange={e => { setSearch2(e.target.value); setShowList2(e.target.value.length > 0) }}
            onBlur={() => setTimeout(() => { setShowList2(false); setSearch2(city2.label) }, 150)}
            placeholder="Rechercher…"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
          />
        </div>
      </div>

      {/* Dropdowns */}
      {showList1 && filtered1.length > 0 && (
        <div className="w-full -mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
          {filtered1.map(v => (
            <button key={v.label} type="button"
              onMouseDown={() => select1(v)}
              className="w-full flex items-center px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0 text-gray-800">
              {v.label}
            </button>
          ))}
        </div>
      )}
      {showList2 && filtered2.length > 0 && (
        <div className="w-full -mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
          {filtered2.map(v => (
            <button key={v.label} type="button"
              onMouseDown={() => select2(v)}
              className="w-full flex items-center px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0 text-gray-800">
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* Les deux horloges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-0.5">
          <p className="text-xs font-semibold text-gray-500 mb-1">{city1.label}</p>
          <p className="text-2xl font-bold tabular-nums leading-none" style={{ color: '#36A6B2' }}>
            {formatHeure(now, city1.tz)}
          </p>
          <p className="text-xs text-gray-400 capitalize leading-tight mt-1">{formatJour(now, city1.tz)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-0.5">
          <p className="text-xs font-semibold text-gray-500 mb-1">{city2.label}</p>
          <p className="text-2xl font-bold tabular-nums leading-none text-gray-800">
            {formatHeure(now, city2.tz)}
          </p>
          <p className="text-xs text-gray-400 capitalize leading-tight mt-1">{formatJour(now, city2.tz)}</p>
        </div>
      </div>

      {/* Badge décalage */}
      <div className="flex justify-center">
        <span className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ background: diffColor.bg, color: diffColor.text }}>
          {diffLabel} entre les deux
        </span>
      </div>
    </div>
  )
}
