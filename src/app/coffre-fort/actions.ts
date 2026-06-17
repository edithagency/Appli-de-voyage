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
  const nomPersonnalise = (formData.get('nom') as string)?.trim() || null

  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' }
  if (file.size > 10 * 1024 * 1024) return { error: 'Fichier trop lourd (max 10 Mo).' }

  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
  const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']
  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Type de fichier non autorisé (PDF, JPG ou PNG uniquement).' }
  }

  const storagePath = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, { contentType: file.type })

  if (uploadError) return { error: 'Erreur lors de l\'upload.' }

  const { error: dbError } = await supabase.from('documents').insert({
    uploaded_by: user.id,
    belongs_to: membreId,
    voyage_id: voyageId,
    type,
    nom_fichier: nomPersonnalise || file.name,
    storage_path: storagePath,
    date_expiration: dateExpiration || null,
  })

  if (dbError) {
    await supabase.storage.from('documents').remove([storagePath])
    return { error: 'Erreur lors de l\'enregistrement.' }
  }

  revalidatePath('/coffre-fort')
  if (voyageId) revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}

export async function supprimerDocument(id: string, storagePath: string, voyageId?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  await supabase.storage.from('documents').remove([storagePath])
  await supabase.from('documents').delete().eq('id', id).eq('uploaded_by', user.id)

  revalidatePath('/coffre-fort')
  if (voyageId) revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}

export async function getSignedUrl(storagePath: string) {
  const supabase = await createClient()
  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 60)
  return data?.signedUrl ?? null
}
