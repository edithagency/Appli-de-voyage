-- Table pays
create table public.pays (
  code text primary key,
  nom_fr text not null,
  emoji text,
  visa_requis_france boolean default false,
  visa_details text,
  vaccins_obligatoires text,
  vaccins_recommandes text,
  douane_infos text,
  devise text,
  symbole_devise text,
  taux_change_approx numeric,
  type_prise_electrique text,
  niveau_securite text check (niveau_securite in ('vert', 'orange', 'rouge')) default 'vert',
  infos_securite text,
  meilleure_periode text,
  saison_pluies text,
  urgence_police text,
  urgence_ambulance text,
  urgence_ambassade_france text,
  phrases_essentielles jsonb default '[]',
  created_at timestamptz default now()
);

-- Table voyages
create table public.voyages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  nom text not null,
  destination text not null,
  pays_code text references public.pays(code),
  date_depart date not null,
  date_retour date not null,
  statut text check (statut in ('en_preparation', 'termine')) default 'en_preparation',
  membres_ids uuid[] default '{}',
  created_at timestamptz default now()
);

-- RLS voyages
alter table public.voyages enable row level security;
create policy "voyages: accès propre" on public.voyages
  for all using (auth.uid() = user_id);

-- pays est public en lecture
alter table public.pays enable row level security;
create policy "pays: lecture publique" on public.pays
  for select using (true);

-- Seed : 10 destinations populaires
insert into public.pays (code, nom_fr, emoji, visa_requis_france, visa_details, vaccins_recommandes, douane_infos, devise, symbole_devise, taux_change_approx, type_prise_electrique, niveau_securite, meilleure_periode, saison_pluies, urgence_police, urgence_ambulance, urgence_ambassade_france, phrases_essentielles) values

('MA', 'Maroc', '🇲🇦', false, 'Pas de visa requis pour les Français, séjour jusqu''à 90 jours.', 'Hépatite A, Hépatite B recommandés.', 'Limite : 10 000€ en devises. Produits alimentaires frais interdits.', 'Dirham marocain (MAD)', 'MAD', 10.8, 'Type C/E (identique à la France)', 'vert', 'Avril–juin et septembre–octobre', 'Juillet–août sur le littoral, pas de saison des pluies marquée.', '19', '15', '+212 537 68 97 00', '[{"fr":"Bonjour","langue_locale":"Marhaba","phonetique":"Mar-ha-ba"},{"fr":"Merci","langue_locale":"Choukran","phonetique":"Chouk-ran"},{"fr":"Où est... ?","langue_locale":"Fin kayn... ?","phonetique":"Fin kayn"},{"fr":"Combien ça coûte ?","langue_locale":"Bchhal hadchi ?","phonetique":"Bchhal had-chi"}]'),

('JP', 'Japon', '🇯🇵', false, 'Pas de visa requis pour les Français, séjour jusqu''à 90 jours.', 'Aucun vaccin obligatoire. Hépatite A recommandé.', 'Limite : 1 000 000 yens en espèces sans déclaration.', 'Yen japonais (JPY)', '¥', 0.006, 'Type A/B (adaptateur nécessaire)', 'vert', 'Mars–mai (cerisiers) et octobre–novembre', 'Juin–juillet (tsuyu)', '110', '119', '+81 3 5798 6000', '[{"fr":"Bonjour","langue_locale":"Konnichiwa","phonetique":"Kon-ni-chi-wa"},{"fr":"Merci","langue_locale":"Arigatou","phonetique":"A-ri-ga-tou"},{"fr":"Où est... ?","langue_locale":"...wa doko desu ka ?","phonetique":"...wa do-ko des-ka"},{"fr":"L''addition","langue_locale":"Okaikei","phonetique":"O-kai-kei"}]'),

('TH', 'Thaïlande', '🇹🇭', false, 'Pas de visa requis pour les Français, séjour jusqu''à 30 jours.', 'Hépatite A, typhoïde, rage (si randonnée) recommandés.', 'Limite : 450 000 bahts en espèces.', 'Baht thaïlandais (THB)', '฿', 0.026, 'Type A/B/C (adaptateur recommandé)', 'vert', 'Novembre–avril', 'Mai–octobre', '191', '1669', '+66 2 657 5100', '[{"fr":"Bonjour","langue_locale":"Sawasdee","phonetique":"Sa-was-dee"},{"fr":"Merci","langue_locale":"Khob khun","phonetique":"Khob-khun"},{"fr":"Où est... ?","langue_locale":"...yuu tee nai ?","phonetique":"...you tee nai"},{"fr":"Combien ?","langue_locale":"Tao rai ?","phonetique":"Tao-rai"}]'),

('PT', 'Portugal', '🇵🇹', false, 'Espace Schengen — pas de formalités pour les Français.', 'Aucun vaccin spécifique requis.', 'Règles UE standard.', 'Euro (EUR)', '€', 1.0, 'Type F (identique à la France)', 'vert', 'Mai–septembre', 'Octobre–mars au nord', '112', '112', '+351 21 392 0000', '[{"fr":"Bonjour","langue_locale":"Olá","phonetique":"O-la"},{"fr":"Merci","langue_locale":"Obrigado/a","phonetique":"O-bri-ga-dou"},{"fr":"Où est... ?","langue_locale":"Onde fica... ?","phonetique":"On-de fi-ka"},{"fr":"L''addition","langue_locale":"A conta","phonetique":"A kon-ta"}]'),

('GR', 'Grèce', '🇬🇷', false, 'Espace Schengen — pas de formalités pour les Français.', 'Aucun vaccin spécifique requis.', 'Règles UE standard.', 'Euro (EUR)', '€', 1.0, 'Type C/F (identique à la France)', 'vert', 'Juin–septembre', 'Novembre–mars', '100', '166', '+30 210 361 1663', '[{"fr":"Bonjour","langue_locale":"Yassas","phonetique":"Ya-sas"},{"fr":"Merci","langue_locale":"Efcharisto","phonetique":"Ef-cha-ris-to"},{"fr":"Où est... ?","langue_locale":"Pou einai... ?","phonetique":"Pou i-ne"},{"fr":"L''addition","langue_locale":"Ton logariasmo","phonetique":"Ton lo-ga-rias-mo"}]'),

('US', 'États-Unis', '🇺🇸', false, 'ESTA obligatoire (14€, valable 2 ans). À demander en ligne au moins 72h avant.', 'Aucun vaccin obligatoire.', 'Franchise douanière : 800 USD. Produits alimentaires très réglementés.', 'Dollar américain (USD)', '$', 0.92, 'Type A/B (adaptateur nécessaire)', 'vert', 'Variable selon la région', 'Variable selon la région', '911', '911', '+1 202 944 6000', '[{"fr":"Bonjour","langue_locale":"Hello","phonetique":"Hé-lo"},{"fr":"Merci","langue_locale":"Thank you","phonetique":"Thénk you"},{"fr":"Où est... ?","langue_locale":"Where is... ?","phonetique":"Ouère iz"},{"fr":"L''addition","langue_locale":"The check/bill","phonetique":"De tchèk"}]'),

('ID', 'Indonésie (Bali)', '🇮🇩', true, 'Visa on arrival disponible à l''aéroport : 35 USD, valable 30 jours, renouvelable une fois.', 'Hépatite A, typhoïde, rage recommandés. Fièvre jaune si transit par zone endémique.', 'Maximum 500 USD en espèces sans déclaration.', 'Roupie indonésienne (IDR)', 'Rp', 0.000057, 'Type C/F (identique à la France)', 'vert', 'Avril–octobre (saison sèche)', 'Novembre–mars', '110', '118', '+62 21 2355 7600', '[{"fr":"Bonjour","langue_locale":"Halo / Selamat pagi","phonetique":"Ha-lo / Se-la-mat pa-gi"},{"fr":"Merci","langue_locale":"Terima kasih","phonetique":"Te-ri-ma ka-si"},{"fr":"Où est... ?","langue_locale":"Di mana... ?","phonetique":"Di ma-na"},{"fr":"Combien ?","langue_locale":"Berapa harganya ?","phonetique":"Be-ra-pa har-ga-nya"}]'),

('MX', 'Mexique', '🇲🇽', false, 'Pas de visa requis pour les Français, séjour jusqu''à 180 jours.', 'Hépatite A, typhoïde recommandés. Fièvre jaune si venant de zone endémique.', 'Maximum 10 000 USD en espèces.', 'Peso mexicain (MXN)', '$', 0.048, 'Type A/B (adaptateur nécessaire)', 'orange', 'Décembre–avril', 'Juin–octobre', '911', '911', '+52 55 9171 8900', '[{"fr":"Bonjour","langue_locale":"Buenos días","phonetique":"Bouè-nos di-as"},{"fr":"Merci","langue_locale":"Gracias","phonetique":"Gra-cias"},{"fr":"Où est... ?","langue_locale":"¿Dónde está... ?","phonetique":"Don-dé és-ta"},{"fr":"L''addition","langue_locale":"La cuenta","phonetique":"La kouen-ta"}]'),

('IT', 'Italie', '🇮🇹', false, 'Espace Schengen — pas de formalités pour les Français.', 'Aucun vaccin spécifique requis.', 'Règles UE standard.', 'Euro (EUR)', '€', 1.0, 'Type C/F/L (prise italienne parfois)', 'vert', 'Avril–juin et septembre–octobre', 'Novembre–mars au nord', '113', '118', '+39 06 686 011', '[{"fr":"Bonjour","langue_locale":"Buongiorno","phonetique":"Buon-jor-no"},{"fr":"Merci","langue_locale":"Grazie","phonetique":"Gra-tsié"},{"fr":"Où est... ?","langue_locale":"Dov''è... ?","phonetique":"Do-vè"},{"fr":"L''addition","langue_locale":"Il conto","phonetique":"Il kon-to"}]'),

('SN', 'Sénégal', '🇸🇳', false, 'Pas de visa requis pour les Français, séjour jusqu''à 90 jours.', 'Fièvre jaune OBLIGATOIRE. Paludisme : traitement préventif recommandé. Hépatite A, typhoïde recommandés.', 'Maximum 1 000 000 FCFA en espèces.', 'Franc CFA (XOF)', 'FCFA', 0.0015, 'Type C/D/E (identique à la France)', 'vert', 'Novembre–avril (saison sèche)', 'Juin–octobre', '17', '15', '+221 33 889 3800', '[{"fr":"Bonjour","langue_locale":"Na nga def (Wolof)","phonetique":"Na-nga-def"},{"fr":"Merci","langue_locale":"Jërejëf","phonetique":"Djeré-djef"},{"fr":"Où est... ?","langue_locale":"Fan la... ?","phonetique":"Fan-la"},{"fr":"Combien ?","langue_locale":"Na yëgël nañu ?","phonetique":"Na-yé-gel-na-nou"}]');
