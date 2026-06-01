'use client'

import { saveTypeVoyage, skipOnboarding } from '../actions'

const types = [
  { value: 'aventure', emoji: '🏔️', label: 'Aventure', desc: 'Randonnée, trek, nature sauvage' },
  { value: 'plage', emoji: '🏖️', label: 'Plage & soleil', desc: 'Mer, détente, farniente' },
  { value: 'city-trip', emoji: '🏙️', label: 'City-trip', desc: 'Musées, restos, culture urbaine' },
  { value: 'luxe', emoji: '✨', label: 'Luxe', desc: 'Hôtels 5★, expériences premium' },
]

export default function OnboardingStep2() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i}
            className={`h-2 rounded-full transition-all ${i <= 2 ? 'w-8 bg-[#534AB7]' : 'w-8 bg-gray-200 dark:bg-gray-700'}`} />
        ))}
        <span className="text-xs text-gray-400 ml-1">2 / 3</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Quel type de voyage ?</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Pour t'envoyer des conseils adaptés.</p>

      <form action={saveTypeVoyage} className="flex flex-col gap-3">
        {types.map(t => (
          <label key={t.value}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-[#534AB7] hover:bg-purple-50 dark:hover:bg-purple-900/10 cursor-pointer transition-all">
            <input type="radio" name="type" value={t.value} required className="accent-[#534AB7] w-4 h-4" />
            <span className="text-2xl">{t.emoji}</span>
            <div>
              <div className="font-semibold text-gray-800 dark:text-white">{t.label}</div>
              <div className="text-xs text-gray-400">{t.desc}</div>
            </div>
          </label>
        ))}

        <button type="submit"
          className="mt-2 w-full py-3 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
          Continuer →
        </button>
      </form>

      <form action={skipOnboarding} className="mt-3">
        <button type="submit" className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2">
          Passer pour l'instant
        </button>
      </form>
    </div>
  )
}
