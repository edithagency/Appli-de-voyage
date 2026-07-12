-- ============================================================
-- Retire la phrase "Visa obligatoire au-delà" du texte de la
-- section Visa (déjà couvert par la section "Visa si séjour
-- > 60 jours").
-- ============================================================

update public.pays set
  visa_details = 'Pas de visa pour un séjour touristique jusqu''à 60 jours (susceptible de revenir à 30 jours, vérifier avant le départ).'
where code = 'TH';
