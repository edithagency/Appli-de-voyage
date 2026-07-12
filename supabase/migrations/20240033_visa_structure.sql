-- ============================================================
-- Structure la carte Visa en 3 sections, comme Sécurité :
-- Démarche obligatoire (TDAC), Visa (≤ 60 jours), Visa si séjour
-- > 60 jours (entree_details.prolongation, réutilisé).
-- ============================================================

update public.pays set
  entree_details = jsonb_set(
    entree_details,
    '{formulaire_arrivee}',
    '{
      "nom": "Thailand Digital Arrival Card (TDAC)",
      "obligatoire": true,
      "delai": "à remplir en ligne dans les 3 jours précédant l''arrivée",
      "lien": "https://tdac.immigration.go.th/arrival-card/#/home",
      "lien_label": "Obtenir la Thailand Digital Arrival Card",
      "note": null
    }'::jsonb
  ) || jsonb_build_object(
    'prolongation', 'Pour un séjour d''une durée supérieure à 60 jours, l''obtention d''un visa est obligatoire. Les visas touristiques sont délivrés non pas en Thaïlande mais par les consulats de Thaïlande à l''étranger. La procédure de visa prend environ 4 semaines, voire plus si le dossier est incomplet.'
  ),

  visa_details = 'Pas de visa pour un séjour touristique jusqu''à 60 jours (susceptible de revenir à 30 jours, vérifier avant le départ). Visa obligatoire au-delà.'

where code = 'TH';
