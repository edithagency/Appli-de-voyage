'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const file = formData.get('file') as File
  const type = formData.get('type') as string
  const membreId = formData.get('membre_id') as string || null
  const voyageId = formData.get('voyage_id') as string || null
  const dateExpiration = formData.get('date_expiration') as string || null

  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' }
  if (file.size > 10 * 1024 * 1024) return { error: 'Fichier trop lourd (max 10 Mo).' }

  const ext = file.name.split('.').pop()
  const storagePath = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, { contentType: file.type })

  if (uploadError) return { error: 'Erreur lors de l\'upload.' }

  const { error: dbError } = await supabase.from('documents').insert({
    user_id: user.id,
    membre_id: membreId,
    voyage_id: voyageId,
    type,
    nom_fichier: file.name,
    storage_path: storagePath,
    date_expiration: dateExpiration || null,
  })

  if (dbError) {
    await supabase.storage.from('documents').remove([storagePath])
    return { error: 'Erreur lors de l\'enregistrement.' }
  }

  revalidatePath('/coffre-fort')
  return { success: true }
}

export async function supprimerDocument(id: string, storagePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  await supabase.storage.from('documents').remove([storagePath])
  await supabase.from('documents').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/coffre-fort')
  return { success: true }
}

export async function getSignedUrl(storagePath: string) {
  const supabase = await createClient()
  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 60)
  return data?.signedUrl ?? null
}
