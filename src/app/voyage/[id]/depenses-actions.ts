'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function ajouterDepense(voyageId: string, data: {
  label: string
  montant: number
  payeur_prenom: string
  participants: string[]
  categorie?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: membres } = await supabase.from('voyage_membres').select('id, prenom').eq('voyage_id', voyageId)
  const idByPrenom = Object.fromEntries((membres ?? []).map(m => [m.prenom, m.id]))

  const { error } = await supabase.from('depenses').insert({
    voyage_id: voyageId,
    user_id: user.id,
    payeur_membre_id: idByPrenom[data.payeur_prenom] ?? null,
    participants_membre_ids: data.participants.map(p => idByPrenom[p]).filter(Boolean),
    label: data.label,
    montant: data.montant,
    categorie: data.categorie ?? 'autre',
  })

  if (error) return { error: `${error.message} (code: ${error.code})` }
  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}

export async function supprimerDepense(id: string, voyageId: string) {
  const supabase = await createClient()
  await supabase.from('depenses').delete().eq('id', id)
  revalidatePath(`/voyage/${voyageId}`)
}

export async function mettreAJourBudget(voyageId: string, budget: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('voyages')
    .update({ budget_total: budget })
    .eq('id', voyageId)
    .eq('user_id', user.id)

  revalidatePath(`/voyage/${voyageId}`)
}
