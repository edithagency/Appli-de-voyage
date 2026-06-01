'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveProfilVoyageur(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase
    .from('users')
    .update({ profil_voyageur: formData.get('profil') })
    .eq('id', user.id)

  redirect('/onboarding/step2')
}

export async function saveTypeVoyage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase
    .from('users')
    .update({ type_voyage_prefere: formData.get('type') })
    .eq('id', user.id)

  redirect('/onboarding/step3')
}

export async function saveMembres(membres: { prenom: string; date_naissance: string; type: 'adulte' | 'enfant' }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  if (membres.length > 0) {
    const rows = membres.map(m => ({ ...m, user_id: user.id }))
    const { error } = await supabase.from('membres_foyer').insert(rows)
    if (error) return { error: 'Erreur lors de la sauvegarde.' }
  }

  return { success: true }
}

export async function skipOnboarding() {
  redirect('/dashboard')
}
