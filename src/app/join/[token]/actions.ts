'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Réclame le profil de façon atomique : si quelqu'un d'autre l'a pris entre temps
// (deux personnes ouvrent le même lien et choisissent le même nom), l'update
// ne touche aucune ligne — on le détecte via .select() plutôt que de faire
// confiance à l'absence d'erreur SQL.
async function reclamerProfil(supabase: Awaited<ReturnType<typeof createClient>>, membreId: string, voyageId: string, userId: string) {
  const { data } = await supabase
    .from('voyage_membres')
    .update({ user_id: userId, statut_invitation: 'joined', rejoint_le: new Date().toISOString() })
    .eq('id', membreId)
    .eq('voyage_id', voyageId)
    .neq('statut_invitation', 'joined')
    .select('id')

  return (data?.length ?? 0) > 0
}

export async function rejoindreVoyage(formData: FormData, token: string, membreId: string, voyageId: string) {
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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'}/join/${token}`,
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Connexion échouée.' }

  const reclame = await reclamerProfil(supabase, membreId, voyageId, user.id)
  if (!reclame) {
    return { error: 'Ce profil vient d\'être pris par quelqu\'un d\'autre. Choisis-en un autre.', profileTaken: true }
  }

  // Créer le profil utilisateur si besoin
  await supabase.from('users').upsert({
    id: user.id,
    email: user.email!,
    prenom: user.user_metadata?.prenom ?? null,
    nom: user.user_metadata?.nom ?? null,
  }, { onConflict: 'id', ignoreDuplicates: true })

  redirect(`/voyage/${voyageId}`)
}

export async function rejoindreVoyageConnecte(membreId: string, voyageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const reclame = await reclamerProfil(supabase, membreId, voyageId, user.id)
  if (!reclame) {
    return { error: 'Ce profil vient d\'être pris par quelqu\'un d\'autre. Choisis-en un autre.', profileTaken: true }
  }

  redirect(`/voyage/${voyageId}`)
}
