-- ============================================================
-- Remplace les 2 sections Passeport par une seule section
-- "Conditions de validité" avec plusieurs paragraphes espacés
-- (entree_details.passeport_conditions, tableau de textes).
-- ============================================================

update public.pays set
  entree_details = coalesce(entree_details, '{}'::jsonb) || jsonb_build_object(
    'passeport_conditions', '[
      "Valable au moins 6 mois à compter de la date d''entrée sur le territoire.",
      "Le passeport ne doit pas être déchiré ou abîmé, sous peine de se voir refuser l''entrée sur le territoire thaïlandais sans intervention possible de l''ambassade.",
      "Au moins 1 page vierge est recommandée pour les tampons d''entrée et de sortie."
    ]'::jsonb
  )
where code = 'TH';
