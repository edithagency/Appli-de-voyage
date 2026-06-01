-- Ajout colonne liens officiels
alter table public.pays
  add column if not exists liens_officiels jsonb default '[]';

-- USA : ESTA
update public.pays set liens_officiels = '[
  {"label": "Demander l''ESTA (obligatoire)", "url": "https://esta.cbp.dhs.gov", "type": "visa"}
]' where code = 'US';

-- Bali/Indonésie : taxe + visa
update public.pays set liens_officiels = '[
  {"label": "Payer la taxe touristique Bali (obligatoire)", "url": "https://lovebali.baliprov.go.id", "type": "taxe"},
  {"label": "E-Visa Indonésie (alternative au VOA)", "url": "https://molina.imigrasi.go.id", "type": "visa"}
]' where code = 'ID';

-- Sénégal : vaccin fièvre jaune
update public.pays set liens_officiels = '[
  {"label": "Centres de vaccination fièvre jaune (France)", "url": "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/senegal/", "type": "sante"},
  {"label": "Conseils aux voyageurs — Sénégal", "url": "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/senegal/", "type": "info"}
]' where code = 'SN';

-- Japon : conseils voyageurs
update public.pays set liens_officiels = '[
  {"label": "Conseils aux voyageurs — Japon", "url": "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/japon/", "type": "info"}
]' where code = 'JP';

-- Thaïlande
update public.pays set liens_officiels = '[
  {"label": "Conseils aux voyageurs — Thaïlande", "url": "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/thailande/", "type": "info"}
]' where code = 'TH';

-- Maroc
update public.pays set liens_officiels = '[
  {"label": "Conseils aux voyageurs — Maroc", "url": "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/maroc/", "type": "info"}
]' where code = 'MA';

-- Mexique
update public.pays set liens_officiels = '[
  {"label": "Conseils aux voyageurs — Mexique", "url": "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/mexique/", "type": "info"}
]' where code = 'MX';

-- Portugal
update public.pays set liens_officiels = '[
  {"label": "Conseils aux voyageurs — Portugal", "url": "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/portugal/", "type": "info"}
]' where code = 'PT';

-- Grèce
update public.pays set liens_officiels = '[
  {"label": "Conseils aux voyageurs — Grèce", "url": "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/grece/", "type": "info"}
]' where code = 'GR';

-- Italie
update public.pays set liens_officiels = '[
  {"label": "Conseils aux voyageurs — Italie", "url": "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/italie/", "type": "info"}
]' where code = 'IT';
