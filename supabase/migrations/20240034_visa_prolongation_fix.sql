-- ============================================================
-- Filet de sécurité : re-pose entree_details.prolongation pour
-- la Thaïlande (la section "Visa si séjour > 60 jours" de la
-- carte Visa n'apparaissait pas côté client).
-- ============================================================

update public.pays set
  entree_details = coalesce(entree_details, '{}'::jsonb) || jsonb_build_object(
    'prolongation', 'Pour un séjour d''une durée supérieure à 60 jours, l''obtention d''un visa est obligatoire. Les visas touristiques sont délivrés non pas en Thaïlande mais par les consulats de Thaïlande à l''étranger. La procédure de visa prend environ 4 semaines, voire plus si le dossier est incomplet.'
  )
where code = 'TH';
