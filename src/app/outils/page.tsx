import { createClient } from '@/lib/supabase/server'
import OutilsClient from './OutilsClient'

export default async function OutilsPage({
  searchParams,
}: {
  searchParams: Promise<{ pays?: string; open?: string }>
}) {
  const { pays: paysParam, open } = await searchParams
  const supabase = await createClient()

  // Numéros d'urgence et Trousse médicale partagent ces mêmes champs avec
  // l'onglet Infos voyage — un seul jeu de données, affiché différemment.
  const { data: pays } = await supabase
    .from('pays')
    .select(`
      code, nom_fr, emoji,
      urgence_police, urgence_ambulance, urgence_ambassade_france, urgence_autres, ambassade_info,
      sante_details, phrases_essentielles
    `)
    .order('nom_fr')

  // Page accessible sans compte : les favoris ne se chargent depuis Supabase
  // que si l'utilisateur est connecté, sinon OutilsClient retombe sur le
  // localStorage (pas de sync entre appareils dans ce cas).
  const { data: { user } } = await supabase.auth.getUser()
  let favorisInitiaux: string[] = []
  if (user) {
    const { data: favoris } = await supabase
      .from('outils_favoris')
      .select('outil_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    favorisInitiaux = (favoris ?? []).map(f => f.outil_id)
  }

  return (
    <OutilsClient
      pays={pays ?? []}
      defaultPaysCode={paysParam ?? null}
      autoOpenTool={open ?? null}
      isLoggedIn={!!user}
      favorisInitiaux={favorisInitiaux}
    />
  )
}
