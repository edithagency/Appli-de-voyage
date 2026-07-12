-- ============================================================
-- Structure la carte Argent en sections titrées (Devise, Paiement,
-- Convertisseur) et ajoute un code devise à 3 lettres (ex: THB)
-- utilisé dans le titre du convertisseur.
-- ============================================================

alter table public.pays
  add column if not exists devise_code text;

update public.pays set
  devise = 'Baht thaïlandais (THB - ฿)',
  devise_code = 'THB'
where code = 'TH';
