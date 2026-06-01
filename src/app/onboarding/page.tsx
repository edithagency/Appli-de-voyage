'use client'

import { saveProfilVoyageur, skipOnboarding } from './actions'

const profils = [
  { value: 'solo', emoji: '🧳', label: 'Solo', desc: 'Je voyage seul(e)' },
  { value: 'couple', emoji: '💑', label: 'En couple', desc: 'Nous partons à deux' },
  { value: 'famille', emoji: '👨‍👩‍👧‍👦', label: 'En famille', desc: 'Avec enfants' },
  { value: 'groupe', emoji: '👯', label: 'En groupe', desc: 'Entre amis ou collègues' },
]

export default function OnboardingStep1() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className={`h-2 rounded-full transition-all ${i === 1 ? 'w-8 bg-[#534AB7]' : 'w-8 bg-gray-200 dark:bg-gray-700'}`} />
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-1">1 / 3</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Comment tu voyages ?</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">On adapte tes checklists selon ton profil.</p>

      <form action={saveProfilVoyageur} className="flex flex-col gap-3">
        {profils.map(p => (
          <label key={p.value}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-[#534AB7] hover:bg-purple-50 dark:hover:bg-purple-900/10 cursor-pointer transition-all group">
            <input type="radio" name="profil" value={p.value} required className="accent-[#534AB7] w-4 h-4" />
            <span className="text-2xl">{p.emoji}</span>
            <div>
              <div className="font-semibold text-gray-800 dark:text-white">{p.label}</div>
              <div className="text-xs text-gray-400">{p.desc}</div>
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
