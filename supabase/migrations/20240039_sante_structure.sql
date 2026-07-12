-- ============================================================
-- Restructure la carte Santé en sections titrées, comme Sécurité/
-- Visa/Passeport : Vaccins obligatoire, Vaccins recommandé, À savoir.
-- ============================================================

update public.pays set
  vaccins_recommandes = 'Hépatite A. Hépatite B (séjours prolongés). Typhoïde (séjour rural ou long). Rage si activités à risque ou séjour isolé.',

  sante_details = coalesce(sante_details, '{}'::jsonb) || jsonb_build_object(
    'vaccins_obligatoire', '[
      "Aucun, sauf si arrivée depuis un pays où la fièvre jaune est présente (certificat exigé).",
      "Sauf fièvre jaune obligatoire uniquement si transit de plus de 12h dans un pays endémique (Afrique sub-saharienne, Guyane française, Brésil, Colombie...)."
    ]'::jsonb,
    'a_savoir', '[
      "La dengue est présente partout en Thaïlande, y compris les villes ; il n''y a pas de vaccin disponible pour les voyageurs. Protection avec du répulsif DEET 20% minimum, vêtements couvrants au coucher du soleil.",
      "L''eau du robinet n''est pas potable, l''eau en bouteille est obligatoire y compris pour le lavage de dents. Les glaçons avec un trou au centre sont généralement industriels et peuvent être consommés sans risque."
    ]'::jsonb
  )

where code = 'TH';
