'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function rejoindreVoyage(formData: FormData, token: string, participantId: string) {
  const supabase = await createClient()
  const mode = formData.get('mode') as 'signup' | 'login'
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (mode === 'signup') {
    const prenom = formData.get('prenom') as string
    const nom = formData.get('nom') as string

    if (password.length < 8) return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { prenom, nom },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'}/rejoindre/${token}`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) return { error: 'Un compte existe déjà avec cet email.' }
      return { error: 'Une erreur est survenue. Réessaie.' }
    }

    // Vérifier si l'utilisateur est immédiatement connecté (confirmation désactivée)
    const { data: { user: userAfterSignup } } = await supabase.auth.getUser()
    if (!userAfterSignup) {
      // Confirmation email requise → on retourne un signal spécial
      return { confirmEmail: true }
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: 'Email ou mot de passe incorrect.' }
  }

  // Lier le compte au participant
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Connexion échouée.' }

  // Récupérer le voyage_id
  const { data: participant } = await supabase
    .from('voyage_participants')
    .select('voyage_id')
    .eq('id', participantId)
    .single()

  if (!participant) return { error: 'Invitation introuvable.' }

  await supabase.from('voyage_participants').update({
    user_id: user.id,
    statut: 'rejoint',
    rejoint_le: new Date().toISOString(),
  }).eq('id', participantId)

  // Créer le profil utilisateur si besoin
  await supabase.from('users').upsert({
    id: user.id,
    email: user.email!,
    prenom: user.user_metadata?.prenom ?? null,
    nom: user.user_metadata?.nom ?? null,
  }, { onConflict: 'id', ignoreDuplicates: true })

  redirect(`/voyage/${participant.voyage_id}`)
}

export async function rejoindreVoyageConnecte(participantId: string, voyageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  await supabase.from('voyage_participants').update({
    user_id: user.id,
    statut: 'rejoint',
    rejoint_le: new Date().toISOString(),
  }).eq('id', participantId)

  redirect(`/voyage/${voyageId}`)
}
