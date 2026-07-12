-- ============================================================
-- Simplifie le texte "Vaccins obligatoire" de la carte Santé.
-- ============================================================

update public.pays set
  sante_details = coalesce(sante_details, '{}'::jsonb) || jsonb_build_object(
    'vaccins_obligatoire', '[
      "Aucun vaccin obligatoire.",
      "Sauf fièvre jaune uniquement si transit de plus de 12h dans un pays endémique (Afrique sub-saharienne, Guyane française, Brésil, Colombie...)."
    ]'::jsonb
  )
where code = 'TH';
