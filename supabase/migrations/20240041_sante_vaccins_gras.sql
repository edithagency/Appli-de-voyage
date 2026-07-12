-- ============================================================
-- Met en gras (**...**) les noms de vaccins dans les sections
-- Vaccins obligatoire / Vaccins recommandé de la carte Santé.
-- ============================================================

update public.pays set
  vaccins_recommandes = '**Hépatite A**. **Hépatite B** (séjours prolongés). **Typhoïde** (séjour rural ou long). **Rage** si activités à risque ou séjour isolé.',

  sante_details = coalesce(sante_details, '{}'::jsonb) || jsonb_build_object(
    'vaccins_obligatoire', '[
      "Aucun vaccin obligatoire.",
      "Sauf **fièvre jaune** uniquement si transit de plus de 12h dans un pays endémique (Afrique sub-saharienne, Guyane française, Brésil, Colombie...)."
    ]'::jsonb
  )
where code = 'TH';
