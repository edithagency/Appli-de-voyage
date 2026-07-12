-- ============================================================
-- Structure la carte Électricité en 2 sections titrées :
-- Voltage / Prise (electricite_details, avec **gras**).
-- ============================================================

alter table public.pays
  add column if not exists electricite_details jsonb;

update public.pays set
  electricite_details = jsonb_build_object(
    'voltage', '220 V / 50 Hz',
    'types_prise', 'A, B, C et O',
    'adaptateur', 'Un adaptateur est **souvent nécessaire.**'
  )
where code = 'TH';
