-- ============================================================
-- Structure la carte Passeport en 2 sections, comme Sécurité/Visa :
-- Conditions de validité (entree_details.validite_passeport) et
-- Nombre de pages vierges (nouvelle clé entree_details.pages_vierges).
-- ============================================================

update public.pays set
  entree_details = coalesce(entree_details, '{}'::jsonb) || jsonb_build_object(
    'validite_passeport', 'Valable au moins 6 mois à compter de la date d''entrée sur le territoire. Le passeport ne doit pas être déchiré ou abîmé, sous peine de se voir refuser l''entrée sur le territoire thaïlandais sans intervention possible de l''ambassade.',
    'pages_vierges', 'Au moins 1 page vierge est recommandée pour les tampons d''entrée et de sortie.'
  )
where code = 'TH';
