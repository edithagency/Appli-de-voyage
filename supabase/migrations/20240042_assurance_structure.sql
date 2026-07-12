-- ============================================================
-- Passe assurance_info en tableau de paragraphes (jsonb), comme
-- Passeport/Sécurité, pour espacer le texte de la carte Assurance.
-- ============================================================

alter table public.pays
  alter column assurance_info type jsonb using to_jsonb(assurance_info);

update public.pays set
  assurance_info = '[
    "**Fortement recommandée.**",
    "La Sécu française ne rembourse rien hors UE alors les frais médicaux et d''hospitalisation peuvent être élevés (peut atteindre 50 000€).",
    "Les cartes bancaires premium sont souvent insuffisantes au-delà de 30 jours et exclusion pour scooter. Une assurance couvrant les soins et le rapatriement est conseillée."
  ]'::jsonb
where code = 'TH';
