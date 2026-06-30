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

  return (
    <OutilsClient
      pays={pays ?? []}
      defaultPaysCode={paysParam ?? null}
      autoOpenTool={open ?? null}
    />
  )
}
