'use client'

import { useState, useTransition } from 'react'
import { rejoindreVoyage, rejoindreVoyageConnecte } from './actions'

type Props = {
  token: string
  membreId: string
  membrePrenom: string
  voyageId: string
  isLoggedIn: boolean
  userEmail: string | null
}

export default function RejoindreForm({ token, membreId, membrePrenom, voyageId, isLoggedIn, userEmail }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmEmail, setConfirmEmail] = useState(false)
  const [mode, setMode] = useState<'choix' | 'creer' | 'connecter'>(isLoggedIn ? 'connecter' : 'choix')

  // Si déjà connecté, on propose juste de rejoindre directement
  if (confirmEmail) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center flex flex-col gap-4">
        <div className="text-5xl">📧</div>
        <h2 className="font-bold text-gray-800 text-lg">Vérifier ton email</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Un lien de confirmation a été envoyé à ton adresse email.<br />
          Clique dessus pour finaliser ton inscription et rejoindre le voyage.
        </p>
        <p className="text-xs text-gray-400">Le lien te ramènera directement sur cette page.</p>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <p className="text-center text-gray-600 text-sm mb-1">Tu es connecté(e) en tant que</p>
        <p className="text-center font-semibold text-gray-800 mb-5">{userEmail}</p>
        <p className="text-center text-gray-500 text-sm mb-5">
          En rejoignant, tu seras lié(e) au profil <strong>{membrePrenom}</strong> dans ce voyage.
        </p>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await rejoindreVoyageConnecte(membreId, voyageId)
              if (result?.error) setError(result.error)
            })
          }}
          className="w-full py-4 rounded-xl font-semibold text-white text-lg disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}
        >
          {isPending ? 'Rejoindre...' : `Rejoindre en tant que ${membrePrenom} →`}
        </button>
      </div>
    )
  }

  if (mode === 'choix') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-3">
        <p className="text-center text-gray-600 text-sm mb-2">
          Pour rejoindre le voyage en tant que <strong>{membrePrenom}</strong>, tu as besoin d&apos;un compte Bon Vol.
        </p>
        <button
          type="button"
          onClick={() => setMode('creer')}
          className="w-full py-3 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}
        >
          Créer mon compte
        </button>
        <button
          type="button"
          onClick={() => setMode('connecter')}
          className="w-full py-3 rounded-xl font-semibold border border-[#36A6B2] text-[#36A6B2] hover:bg-blue-50 transition"
        >
          J&apos;ai déjà un compte
        </button>
      </div>
    )
  }

  if (mode === 'creer') {
    return (
      <form
        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4"
        onSubmit={e => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          startTransition(async () => {
            const result = await rejoindreVoyage(data, token, membreId)
            if (result?.confirmEmail) setConfirmEmail(true)
            else if (result?.error) setError(result.error)
          })
        }}
      >
        <h2 className="font-semibold text-gray-800">Créer mon compte</h2>
        <input type="hidden" name="mode" value="signup" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Prénom</label>
            <input
              name="prenom"
              type="text"
              defaultValue={membrePrenom}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
            <input
              name="nom"
              type="text"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="toi@exemple.com"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Minimum 8 caractères"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] text-sm"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}
        >
          {isPending ? 'Création...' : 'Créer mon compte et rejoindre →'}
        </button>
        <button type="button" onClick={() => setMode('choix')} className="text-sm text-gray-400 text-center hover:text-gray-600">
          ← Retour
        </button>
      </form>
    )
  }

  // mode === 'connecter'
  return (
    <form
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4"
      onSubmit={e => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        startTransition(async () => {
          const result = await rejoindreVoyage(data, token, membreId)
          if (result?.error) setError(result.error)
        })
      }}
    >
      <h2 className="font-semibold text-gray-800">Se connecter</h2>
      <input type="hidden" name="mode" value="login" />

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="toi@exemple.com"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe</label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] text-sm"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}
      >
        {isPending ? 'Connexion...' : 'Se connecter et rejoindre →'}
      </button>
      <button type="button" onClick={() => setMode('choix')} className="text-sm text-gray-400 text-center hover:text-gray-600">
        ← Retour
      </button>
    </form>
  )
}
