import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await supabase
    .from('voyage_participants')
    .update({ statut: 'lien_copie' })
    .eq('id', id)
    .eq('statut', 'en_attente')

  return NextResponse.json({ ok: true })
}
