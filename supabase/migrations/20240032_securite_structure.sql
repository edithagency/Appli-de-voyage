-- ============================================================
-- Structure la carte Sécurité en 3 sections : Niveau de vigilance
-- (infos_securite), Zones à éviter (zones_deconseillees, déjà
-- existant), Conseils important (nouvelle colonne conseils_securite).
-- Remplit le contenu Thaïlande avec ces 3 sections.
-- ============================================================

alter table public.pays
  add column if not exists conseils_securite jsonb default '[]';

update public.pays set
  niveau_securite = 'orange',
  infos_securite = 'La grande majorité des zones touristiques sont sûres et fréquentées sans souci par des millions de voyageurs chaque année mais des risques existent dans certaines zones.',

  zones_deconseillees = '[
    {"zone": "Narathiwat, Pattani, Yala, Songkhla", "niveau": "rouge", "note": "Déplacements formellement déconseillés dans les provinces de Narathiwat, Pattani, Yala et le sud de Songkhla (frontière avec la Malaisie)."}
  ]'::jsonb,

  conseils_securite = '[
    "Surveiller ses effets personnels dans les lieux très touristiques.",
    "Éviter les taxis non officiels.",
    "Respecter strictement les lois locales (notamment concernant la famille royale et les stupéfiants, dont les sanctions sont très sévères)."
  ]'::jsonb

where code = 'TH';
