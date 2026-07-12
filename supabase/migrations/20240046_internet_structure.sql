-- ============================================================
-- Structure la carte Internet en 2 sections titrées : Avant le
-- départ (texte + 3 boutons eSIM en attente de lien) / Sur place.
-- ============================================================

alter table public.pays
  add column if not exists reseau_details jsonb;

update public.pays set
  reseau_details = jsonb_build_object(
    'avant_depart', 'Une **eSIM** est recommandée.',
    'esim_liens', '[
      {"label": "eSIM Airalo"},
      {"label": "eSIM Holafly"},
      {"label": "eSIM Nomad"}
    ]'::jsonb,
    'sur_place', 'Les cartes SIM locales **AIS**, **True** et **DTAC** offrent une excellente couverture et sont disponibles dès l''aéroport.'
  )
where code = 'TH';
