-- ============================================================
-- Simplifie le texte de la section Visa.
-- ============================================================

update public.pays set
  visa_details = 'Pas de visa pour un séjour touristique jusqu''à 60 jours.'
where code = 'TH';
