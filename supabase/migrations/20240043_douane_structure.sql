-- ============================================================
-- Structure la carte Douane en 2 sections titrées : À l'aller /
-- Au retour (douane_details, tableaux de textes avec **gras**).
-- ============================================================

alter table public.pays
  add column if not exists douane_details jsonb;

update public.pays set
  douane_details = jsonb_build_object(
    'a_laller', '[
      "L''importation de **cigarettes** est limitée à 200 cigarettes (10 paquets de 20) par passager majeur.",
      "L''importation de **drogues** (peines très lourdes, dont peine de mort).",
      "L''importation d''**alcool** est limitée à un litre par personne.",
      "Les **cigarettes électroniques** et tous produits similaires sont interdits en Thaïlande (importation, vente et usage peuvent être sanctionnés). Le contrevenant à cette réglementation s''expose à une amende de 12 700€ et à une peine de prison de 5 ans.",
      "L''exportation de **statues du Bouddha** est strictement prohibée."
    ]'::jsonb,
    'au_retour', '[
      "L''exportation d''**alcool** est limitée à un litre par personne.",
      "L''exportation de **cigarettes** est limitée à 200 cigarettes (10 paquets de 20) par passager majeur."
    ]'::jsonb
  )
where code = 'TH';
