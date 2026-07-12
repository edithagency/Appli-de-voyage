'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup } from '../actions'
import InfoBlock from '@/components/InfoBlock'

const DEFAULT_EMOJI = '🐼'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    const formData = new FormData(form)
    formData.set('emoji_avatar', DEFAULT_EMOJI)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-5 border border-gray-100 dark:border-gray-800">
      <h1 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Créer votre compte</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Gratuit, sans carte bancaire.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prénom
            </label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              required
              autoComplete="given-name"
              placeholder="Marie"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              autoComplete="family-name"
              placeholder="Dupont"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="toi@exemple.com"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimum 8 caractères"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] focus:border-transparent transition"
          />
        </div>

        {error && (
          <InfoBlock type="erreur">{error}</InfoBlock>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: loading ? '#9CC9CD' : 'linear-gradient(135deg, #36A6B2, #8BD4DC)', boxShadow: '0 4px 12px rgba(54, 166, 178, 0.35)' }}
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="mt-2">
        <InfoBlock type="disclaimer">
          En créant un compte tu acceptes nos{' '}
          <Link href="/politique-confidentialite" className="underline hover:text-[#36A6B2]">conditions de confidentialité</Link>.
        </InfoBlock>
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
        Déjà un compte ?{' '}
        <Link href="/auth/login" className="text-[#36A6B2] font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
