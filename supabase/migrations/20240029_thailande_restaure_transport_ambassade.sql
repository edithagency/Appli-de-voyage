-- ============================================================
-- Restaure transport_info et ambassade_info pour la Thaïlande :
-- ces colonnes n'ont jamais été réellement peuplées sur cette
-- base (migration 20240008 jamais appliquée), et le PDF fourni ne
-- couvrait pas ces sujets — sans données, leurs cartes ("Vols &
-- Aéroports" et le bloc Ambassade dans "Urgences") disparaissaient
-- silencieusement. On remet le contenu d'origine.
-- ============================================================

update public.pays set
  transport_info = '{
    "duree_vol": "Environ 11h30 à 12h30 de vol direct depuis Paris vers Bangkok",
    "compagnies_directes": ["Thai Airways", "Air France"],
    "compagnies_escale": ["Qatar Airways (via Doha)", "Emirates (via Dubaï)", "Turkish Airlines (via Istanbul)", "Etihad Airways (via Abu Dhabi)"],
    "aeroports": [
      {"code": "BKK", "nom": "Suvarnabhumi (Bangkok)"},
      {"code": "DMK", "nom": "Don Mueang (Bangkok, compagnies low-cost)"},
      {"code": "HKT", "nom": "Phuket International Airport"},
      {"code": "CNX", "nom": "Chiang Mai International Airport"},
      {"code": "USM", "nom": "Koh Samui Airport"}
    ]
  }'::jsonb,

  ambassade_info = '{
    "adresse": "35 Charoen Krung Road (Soi 36), Bangkok 10500",
    "tel_standard": "+66 2 657 5100",
    "tel_urgence": "+66 2 657 5100 (numéro d''urgence consulaire en dehors des heures ouvrables)",
    "site": null,
    "page_urgences": null
  }'::jsonb

where code = 'TH';
