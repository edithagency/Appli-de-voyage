-- ============================================================
-- Activités/Itinéraires (générique, multi-pays) + enrichissement
-- du pays Thaïlande (pilote) avec données 2026
-- ============================================================

-- ----------------------------------------------------------
-- 1a. Table activites (lecture publique, comme pays)
-- ----------------------------------------------------------
create table public.activites (
  id uuid default gen_random_uuid() primary key,
  pays_code text references public.pays(code) not null,
  ville text not null,
  categorie text not null check (categorie in (
    'temple_culture','plage','excursion_mer','nature_aventure',
    'marche_shopping','experience','sport','quartier'
  )),
  titre text not null,
  horaires text,
  tarifs text,
  description text,
  notes text,
  photo_url text,
  ordre integer default 0,
  created_at timestamptz default now()
);

alter table public.activites enable row level security;

create policy "activites: lecture publique" on public.activites
  for select using (true);

-- ----------------------------------------------------------
-- 1b. Table activite_wishlist (wishlist partagée par voyage)
-- ----------------------------------------------------------
create table public.activite_wishlist (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  activite_id uuid references public.activites(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (voyage_id, activite_id)
);

alter table public.activite_wishlist enable row level security;

create policy "wishlist: organisateur" on public.activite_wishlist
  for all using (
    auth.uid() = (select user_id from public.voyages where id = voyage_id)
  );

create policy "wishlist: participants" on public.activite_wishlist
  for all using (
    exists (
      select 1 from public.voyage_participants
      where voyage_id = activite_wishlist.voyage_id
      and user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- 1c. Nouvelles colonnes génériques sur pays (jsonb/text,
-- nullable -> no-op pour les pays sans données)
-- ----------------------------------------------------------
alter table public.pays
  add column if not exists entree_details jsonb,
  add column if not exists sante_details jsonb,
  add column if not exists budget_quotidien jsonb,
  add column if not exists argent_notes text,
  add column if not exists zones_deconseillees jsonb,
  add column if not exists reseau_mobile_info text,
  add column if not exists transport_info jsonb,
  add column if not exists assurance_info text,
  add column if not exists urgence_autres jsonb,
  add column if not exists ambassade_info jsonb;

-- ----------------------------------------------------------
-- 1d. Mise à jour du row Thaïlande (TH) avec les infos 2026
-- ----------------------------------------------------------
update public.pays set
  niveau_securite = 'orange',
  infos_securite = 'La grande majorité des zones touristiques (Bangkok, Chiang Mai, Phuket, Krabi, Koh Samui, Koh Tao, Ayutthaya, Chiang Rai...) sont sûres et fréquentées sans souci par des millions de voyageurs chaque année. La vigilance reste de mise comme partout : pickpockets dans les lieux très touristiques et transports bondés, arnaques aux taxis/tuk-tuks sans compteur, jeux de rue truqués (pierres précieuses, paris) à éviter systématiquement. Quelques zones spécifiques (voir « Zones à éviter ») nécessitent une vigilance renforcée ou sont déconseillées.',

  visa_details = 'Exemption de visa de 30 jours pour les ressortissants français en voyage touristique par voie aérienne (60 jours par voie terrestre selon les accords en vigueur). Depuis 2025, un formulaire d''arrivée numérique (TDAC) est obligatoire avant l''entrée dans le pays, en plus de l''exemption de visa. Passeport valide au moins 6 mois après la date d''entrée recommandé.',

  vaccins_recommandes = 'Hépatite A et B, typhoïde recommandés pour tout séjour. Selon l''itinéraire (zones rurales, séjour prolongé, trekking en zone frontalière) : encéphalite japonaise et rage à discuter avec un médecin. Mise à jour DTP (diphtérie-tétanos-polio) recommandée. Le vaccin contre la fièvre jaune n''est pas obligatoire sauf en provenance d''un pays à risque de transmission.',

  douane_infos = 'Interdiction d''importer ou d''exporter des espèces sans déclaration au-delà de 15 000 USD (ou équivalent). L''exportation de statues de Bouddha et d''antiquités est strictement réglementée et nécessite une autorisation officielle. Tabac et alcool soumis à des limites (généralement 200 cigarettes et 1 litre d''alcool par personne). Les cigarettes électroniques et leurs liquides sont interdits à l''importation comme à la possession.',

  meilleure_periode = 'Novembre à février : saison sèche et fraîche, idéale pour l''ensemble du pays. Mars à mai : saison chaude et sèche, températures élevées surtout dans le centre et le nord. Juin à octobre : mousson, variable selon les régions (averses souvent brèves mais intenses).',

  saison_pluies = 'Mousson de juin à octobre sur la majorité du territoire (plus intense de septembre à octobre dans le centre et le nord). La côte est du golfe de Thaïlande (Koh Samui, Koh Tao, Koh Phangan) a un calendrier décalé : sa saison la plus pluvieuse se situe plutôt entre octobre et décembre.',

  type_prise_electrique = 'Type A/B/C/O · 220V/50Hz — les prises de type C (européennes à broches rondes) sont généralement compatibles ; un adaptateur peut être utile pour les prises de type A/B (fiches plates américaines) encore fréquentes.',

  urgence_police = '191 (ou 1155 pour la police touristique, anglophone)',
  urgence_ambulance = '1669',
  urgence_ambassade_france = '+66 2 657 5100',

  entree_details = '{
    "duree_max_sans_visa": "30 jours (exemption de visa pour les passeports français, par voie aérienne)",
    "prolongation": "Prolongation possible une fois, de 30 jours supplémentaires, auprès d''un bureau de l''Immigration thaïlandaise (environ 1900 THB)",
    "validite_passeport": "Passeport valide au moins 6 mois après la date d''entrée prévue",
    "billet_retour": "Un billet retour ou de continuation peut être demandé à l''arrivée par les autorités",
    "preuve_fonds": "Une preuve de fonds (environ 20 000 THB par personne ou 40 000 THB par famille) peut être exigée, contrôle rare mais possible",
    "formulaire_arrivee": {
      "nom": "TDAC (Thailand Digital Arrival Card)",
      "obligatoire": true,
      "delai": "À remplir en ligne dans les 3 jours précédant l''arrivée",
      "lien": null,
      "note": "Remplace la carte d''arrivée/départ papier. Démarche gratuite, à compléter sur le site officiel de l''immigration thaïlandaise avant l''embarquement."
    }
  }'::jsonb,

  sante_details = '{
    "paludisme": "Risque faible dans les zones touristiques principales et les grandes villes. Risque plus élevé dans certaines zones forestières frontalières (Myanmar, Cambodge, Malaisie). Un traitement préventif n''est généralement pas nécessaire pour un circuit classique, mais à discuter avec un médecin en cas de trek en zone frontalière.",
    "dengue": "Présente toute l''année, avec un pic pendant la saison des pluies (juin à octobre). Aucun vaccin n''est recommandé systématiquement : la protection contre les piqûres de moustiques (répulsif, vêtements longs, moustiquaire) est essentielle, y compris en journée.",
    "eau": "L''eau du robinet n''est pas potable : privilégier l''eau en bouteille scellée et éviter les glaçons dans les établissements non touristiques.",
    "trousse_medicale": [
      "Répulsif anti-moustiques (DEET 30-50%)",
      "Antipaludéens si recommandés par le médecin (zones frontalières)",
      "Anti-diarrhéiques et solution de réhydratation orale",
      "Antalgiques / antipyrétiques (paracétamol)",
      "Antiseptique et pansements",
      "Crème solaire indice élevé et after-sun",
      "Antihistaminique (piqûres, allergies)",
      "Médicaments personnels habituels en quantité suffisante (avec ordonnance)"
    ]
  }'::jsonb,

  budget_quotidien = '[
    {"emoji": "🎒", "label": "Backpacker", "montant": "Environ 25-35€/jour (auberge, street food, transports locaux)"},
    {"emoji": "🧳", "label": "Confort", "montant": "Environ 50-80€/jour (hôtel 3*, restaurants, activités)"},
    {"emoji": "✨", "label": "Confort+", "montant": "Environ 100€ et plus/jour (hôtel 4-5*, excursions privées)"}
  ]'::jsonb,

  argent_notes = 'Le baht thaïlandais (THB) est la seule monnaie acceptée localement. Les cartes bancaires sont largement acceptées dans les villes et zones touristiques, mais prévoyez du liquide pour les marchés, taxis et petites îles. Les distributeurs (ATM) prélèvent généralement des frais fixes autour de 220 THB par retrait, quelle que soit la banque émettrice. Pensez à prévenir votre banque de votre voyage pour éviter un blocage de carte.',

  zones_deconseillees = '[
    {"zone": "Provinces de Yala, Pattani, Narathiwat et certaines zones de Songkhla (extrême sud)", "niveau": "rouge", "note": "Tensions séparatistes récurrentes : déconseillé par les autorités françaises sauf raison impérative."},
    {"zone": "Zones frontalières avec le Myanmar (notamment province de Tak/Mae Sot) et avec le Cambodge (secteurs de temples disputés)", "niveau": "orange", "note": "Vigilance renforcée recommandée, tensions ponctuelles possibles."}
  ]'::jsonb,

  reseau_mobile_info = 'Les principaux opérateurs (AIS, TrueMove H, dtac) proposent des cartes SIM touristiques avec data illimitée ou forfait généreux, disponibles dès l''aéroport (environ 200-400 THB pour 7-15 jours). La couverture 4G/5G est très bonne dans les villes et îles touristiques, plus limitée dans les zones reculées du nord. L''eSIM est également une option pratique à activer avant le départ.',

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

  assurance_info = 'Une assurance voyage couvrant les frais médicaux (rapatriement compris) est fortement recommandée : les soins dans les cliniques privées thaïlandaises peuvent être coûteux pour les étrangers. Vérifiez que votre contrat couvre les activités à risque (plongée, scooter, randonnée) — la conduite de deux-roues sans permis adapté est souvent exclue des garanties.',

  urgence_autres = '[
    {"label": "Numéro d''urgence général", "numero": "191"},
    {"label": "Police touristique (anglophone)", "numero": "1155"},
    {"label": "Ambulance / urgences médicales", "numero": "1669"},
    {"label": "Centre d''assistance touristique (TAC)", "numero": "1672"}
  ]'::jsonb,

  ambassade_info = '{
    "adresse": "35 Charoen Krung Road (Soi 36), Bangkok 10500",
    "tel_standard": "+66 2 657 5100",
    "tel_urgence": "+66 2 657 5100 (numéro d''urgence consulaire en dehors des heures ouvrables)",
    "site": null,
    "page_urgences": null
  }'::jsonb

where code = 'TH';

-- ----------------------------------------------------------
-- Seed : ~94 activités Thaïlande, réparties sur 8 villes
-- ----------------------------------------------------------

-- Bangkok (18 activités)
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'temple_culture', 'Grand Palais & Wat Phra Kaeo', '8h30 - 15h30 (dernière entrée 15h00)', '500 THB (environ 13€), gratuit pour les Thaïlandais', 'Résidence officielle des rois de Thaïlande et temple abritant le Bouddha d''Émeraude, le site le plus sacré du pays.', 'ℹ️ Tenue correcte obligatoire : épaules et genoux couverts, sinon prêt de vêtements à l''entrée.
💡 Arrivez dès l''ouverture pour éviter la foule et la chaleur.
⚠️ Méfiez-vous des rabatteurs près de l''entrée qui annoncent une « fermeture exceptionnelle » pour vous rediriger vers des boutiques.', 1);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'temple_culture', 'Wat Pho (Bouddha couché)', '8h00 - 18h30', '300 THB (environ 8€)', 'Abrite l''immense Bouddha couché doré de 46 mètres de long et l''une des plus anciennes écoles de massage thaï.', 'ℹ️ Facile à combiner avec le Grand Palais et Wat Arun (à pied ou en bateau-taxi).
💡 Possibilité de se faire masser sur place par l''école de massage traditionnelle.', 2);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'temple_culture', 'Wat Arun (Temple de l''Aube)', '8h00 - 18h00', '100 THB (environ 2,50€)', 'Temple emblématique recouvert de mosaïques de porcelaine, sur la rive ouest du Chao Phraya, particulièrement beau au coucher du soleil.', '💡 Traversez en ferry depuis Tha Tien (quelques bahts) pour la plus belle vue.
⚠️ Les escaliers centraux sont très raides, attention en montant/descendant.', 3);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'temple_culture', 'Wat Traimit (Bouddha d''or)', '8h00 - 17h00', '100 THB (environ 2,50€)', 'Petit temple abritant une statue de Bouddha massif en or pur de 5,5 tonnes, découverte par hasard sous une couche de plâtre.', 'ℹ️ Situé à l''entrée de Chinatown, facile à combiner avec une visite du quartier.', 4);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'temple_culture', 'Wat Saket (Golden Mount)', '7h30 - 19h00', '100 THB (environ 2,50€)', 'Temple perché sur une colline artificielle offrant l''une des plus belles vues panoramiques sur Bangkok.', '💡 Montez en fin de journée pour profiter du coucher de soleil sur la ville.
⚠️ Environ 300 marches pour atteindre le sommet, prévoir de l''eau.', 5);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'marche_shopping', 'Marché flottant Damnoen Saduak', '7h00 - 12h00 (idéalement avant 9h)', 'Entrée gratuite, balade en barque environ 200-400 THB/pers', 'Marché flottant emblématique où les vendeuses naviguent entre les canaux pour proposer fruits, plats et souvenirs.', 'ℹ️ À environ 1h30 de route de Bangkok, prévoir une excursion à la journée.
💡 Négociez le prix de la balade en barque avant de monter.
⚠️ Très touristique : pour une ambiance plus authentique, préférez le marché de Tha Kha le week-end.', 6);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'marche_shopping', 'Marché aux trains Maeklong', 'Train env. 8 fois/jour (~8h30, 11h, 14h30, 17h40, horaires variables)', 'Gratuit', 'Marché installé directement sur les voies ferrées : les étals se replient en quelques secondes au passage du train.', 'ℹ️ Souvent combiné avec Damnoen Saduak dans la même excursion.
💡 Vérifiez l''horaire du train à l''avance pour ne pas attendre trop longtemps.', 7);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'marche_shopping', 'Chatuchak Weekend Market', 'Samedi-dimanche, 9h00 - 18h00', 'Entrée gratuite', 'Un des plus grands marchés du monde avec plus de 8000 stands : vêtements, artisanat, déco, animaux, street food.', 'ℹ️ Immense et facile de s''y perdre : repérez les sections sur un plan dès l''entrée.
💡 Venez tôt le matin pour éviter la chaleur et la foule.
⚠️ Pensez à négocier les prix, surtout sur les articles non alimentaires.', 8);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'marche_shopping', 'Marché de Chinatown (Yaowarat)', 'Ambiance maximale 18h00 - 00h00', 'Gratuit (street food à partir de 30-100 THB)', 'Le plus grand quartier chinois d''Asie, célèbre pour sa street food de nuit et ses enseignes lumineuses.', '💡 Goûtez les nouilles de riz, fruits de mer grillés et nids d''hirondelle.
⚠️ Quartier très fréquenté le soir : surveillez vos affaires dans la foule.', 9);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'excursion_mer', 'Croisière dîner sur le Chao Phraya', 'Départ vers 19h00-19h30, durée environ 2h', 'Environ 1000-2000 THB/pers selon la compagnie', 'Dîner-croisière sur le fleuve avec vue sur les temples illuminés, le Grand Palais et le pont Rama VIII.', '💡 Réservez à l''avance pour avoir une table côté fenêtre.
ℹ️ Plusieurs formules existent, des bateaux simples aux croisières de luxe avec buffet.', 10);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'quartier', 'Khao San Road', 'Animation continue, surtout 18h00 - 02h00', 'Gratuit (street food/bars dès 30 THB)', 'La rue mythique des routards : bars, street food, tatouages, vêtements et ambiance festive non-stop.', '💡 Bon point de départ pour rejoindre le Grand Palais et Wat Pho à pied.
⚠️ Attention aux pickpockets et aux jeux de rue truqués en soirée.', 11);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'quartier', 'Quartier de Chinatown', 'Toute la journée, ambiance maximale en soirée', 'Gratuit', 'Dédale de ruelles, temples chinois, herboristeries traditionnelles et boutiques d''or à explorer à pied.', 'ℹ️ Pratique pour combiner avec Wat Traimit et le marché de Yaowarat.', 12);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'experience', 'Cours de cuisine thaïe', 'Sessions de 3-4h, matin ou après-midi', 'Environ 900-1500 THB/pers', 'Apprenez à préparer pad thaï, curry et tom yum lors d''un atelier convivial, souvent avec visite de marché incluse.', '💡 Réservez en ligne quelques jours avant, les meilleures écoles se remplissent vite.
ℹ️ La plupart des écoles proposent une option végétarienne.', 13);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'experience', 'Massage thaï traditionnel (école de Wat Pho)', '9h00 - 18h00', 'Environ 300-500 THB/h', 'Massage traditionnel dispensé par l''école attenante au temple Wat Pho, référence dans tout le pays.', '💡 Réservez un créneau le matin, les files d''attente s''allongent l''après-midi.', 14);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'experience', 'Spectacle de cabaret (Calypso)', 'Deux représentations en soirée, environ 19h30 et 21h00', 'Environ 900-1200 THB/pers', 'Spectacle cabaret coloré et festif avec danseurs et danseuses, costumes spectaculaires et numéros de comédie.', '💡 Réservation conseillée la veille, places limitées.', 15);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'sport', 'Muay Thaï (cours ou combat à Rajadamnern)', 'Cours : créneaux dès 7h · Combats : soirées (programmation variable)', 'Cours environ 500-800 THB · billets combats dès 1000 THB', 'Initiez-vous à la boxe thaïe dans un gym local, ou assistez à un combat dans l''un des plus anciens stades du pays.', 'ℹ️ Vérifiez le programme des combats sur place ou auprès de votre hébergement.', 16);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'nature_aventure', 'Lumphini Park', '4h30 - 21h00', 'Gratuit', 'Poumon vert de Bangkok au cœur du quartier des affaires, idéal pour une pause nature, jogging ou cours de tai-chi matinal.', 'ℹ️ On y croise parfois de grands varans se baladant librement près des plans d''eau.', 17);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Bangkok', 'experience', 'Rooftop bar (Mahanakhon Skywalk)', '10h00 - 19h00 (skywalk) · bars en soirée jusqu''à minuit', 'Skywalk environ 880-1050 THB · consommation rooftop dès 400 THB', 'Vue à 360° sur Bangkok depuis le plus haut gratte-ciel de la ville, avec un sol en verre vertigineux au sommet.', '💡 Venez en fin d''après-midi pour profiter du coucher de soleil puis de la vue nocturne.
⚠️ Tenue correcte exigée pour accéder aux rooftop bars (pas de tongs/maillot).', 18);

-- Chiang Mai (14 activités)
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'temple_culture', 'Wat Phra That Doi Suthep', '6h00 - 18h00', 'Entrée temple 50 THB · funiculaire environ 50 THB', 'Temple doré perché sur une montagne surplombant Chiang Mai, l''un des lieux les plus sacrés du nord de la Thaïlande.', 'ℹ️ Accessible en songthaew partagé depuis le centre (environ 30-40 min).
💡 Montez tôt le matin pour la lumière et moins de monde.
⚠️ 300 marches pour atteindre le temple (ou funiculaire payant).', 1);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'temple_culture', 'Wat Chedi Luang', '6h00 - 18h00', 'Environ 40 THB', 'Imposant stupa en briques en partie effondré, l''un des plus grands de l''ancien royaume Lanna.', 'ℹ️ Situé au cœur de la vieille ville, facile à combiner avec d''autres temples à pied.', 2);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'temple_culture', 'Wat Phra Singh', '6h00 - 18h00', 'Environ 40-50 THB', 'Le plus vénéré des temples de Chiang Mai, célèbre pour son magnifique viharn en bois et ses fresques anciennes.', '💡 Visitez en fin de journée quand la lumière dorée illumine la façade.', 3);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'nature_aventure', 'Parc national de Doi Inthanon', '5h30 - 18h00', 'Entrée parc environ 300 THB (cascades incluses)', 'Le point culminant de Thaïlande (2565 m), avec cascades, rizières en terrasses et forêts de pins en altitude.', 'ℹ️ Climat nettement plus frais en altitude, prévoir une petite veste.
💡 Combinez sommet, cascades (Wachirathan, Siriphum) et villages Karen/Hmong dans une excursion à la journée.', 4);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'nature_aventure', 'Sanctuaire d''éléphants éthique', 'Journée complète, départ tôt le matin', 'Environ 2500-3500 THB/pers (transport et repas inclus)', 'Observation et soin des éléphants dans un environnement sans monte ni spectacle, dans le respect du bien-être animal.', 'ℹ️ Privilégiez les sanctuaires sans activité de « balade à dos d''éléphant » pour le bien-être des animaux.
💡 Réservez plusieurs jours à l''avance, les places partent vite.', 5);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'marche_shopping', 'Marché de nuit Night Bazaar', '18h00 - 23h00', 'Gratuit', 'Marché de nuit permanent avec artisanat local, vêtements, souvenirs et nombreux stands de street food.', '💡 La négociation est de mise, comptez environ 30-50% du prix annoncé au départ.', 6);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'marche_shopping', 'Sunday Walking Street', 'Dimanche, 16h00 - 23h00', 'Gratuit', 'Le marché du dimanche envahit toute la rue Ratchadamnoen dans la vieille ville : artisanat, musique live, food stalls.', 'ℹ️ Très fréquenté, surtout en fin de soirée, prévoir du temps pour avancer dans la foule.', 7);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'experience', 'Cours de cuisine thaïe', 'Sessions matin ou après-midi, environ 4h', 'Environ 800-1200 THB/pers', 'Atelier de cuisine souvent organisé dans une ferme bio en périphérie, avec récolte des ingrédients sur place.', '💡 Les formules avec ferme bio incluent souvent un transport aller-retour depuis l''hôtel.', 8);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'experience', 'Cours de Muay Thaï', 'Sessions le matin ou en fin d''après-midi, environ 1h30-2h', 'Environ 300-500 THB/séance', 'Initiation à la boxe thaïe dans des camps d''entraînement locaux ouverts aux débutants comme aux pratiquants.', 'ℹ️ Tenue de sport et bouteille d''eau à prévoir.', 9);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'quartier', 'Vieille ville (Old City)', 'Accessible toute la journée', 'Gratuit', 'Quartier historique entouré de remparts et douves carrées, regroupant une trentaine de temples à explorer à pied ou à vélo.', '💡 La location de vélo est un excellent moyen de visiter les temples au fil des ruelles.', 10);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'nature_aventure', 'Trekking jungle / tribus montagnardes', '1 à 3 jours selon le circuit', 'Environ 1500-3000 THB/jour selon formule', 'Randonnée dans les montagnes du nord à la rencontre des villages Karen, Hmong ou Lisu, avec nuit en hébergement local possible.', 'ℹ️ Choisissez une agence respectueuse qui reverse une part des revenus aux communautés visitées.
⚠️ Prévoir de bonnes chaussures de marche et des vêtements pour la pluie en saison humide.', 11);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'experience', 'Spectacle Khantoke dinner', 'Soirée, environ 19h00 - 21h00', 'Environ 400-600 THB/pers (dîner inclus)', 'Dîner traditionnel du nord servi sur table basse, accompagné de danses folkloriques Lanna.', 'ℹ️ Format convivial assis au sol sur coussins, prévoir une tenue confortable.', 12);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'nature_aventure', 'Cascades de Bua Thong (cascades collantes)', '8h00 - 17h00', 'Gratuit (parking/contribution quelques dizaines de THB)', 'Cascades calcaires uniques où la roche offre une adhérence naturelle permettant de grimper pieds nus le long de l''eau.', '💡 Marchez pieds nus sur la roche pour ne pas glisser, contre-intuitif mais ça fonctionne très bien.
ℹ️ À environ 1h de route au nord de Chiang Mai.', 13);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Mai', 'sport', 'Flight of the Gibbon (tyrolienne)', 'Départs le matin, durée environ 3-4h', 'Environ 3000-4000 THB/pers', 'Parcours de tyroliennes géantes au-dessus de la canopée de la jungle, avec ponts suspendus et rappels.', '⚠️ Sensations fortes garanties, prévoir des chaussures fermées.', 14);

-- Phuket (16 activités)
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'plage', 'Patong Beach', 'Accès libre', 'Gratuit (transats payants environ 100-200 THB)', 'La plage la plus animée de Phuket, bordée de bars, restaurants et activités nautiques, vie nocturne intense à proximité.', '⚠️ Drapeaux de sécurité à respecter, courants parfois forts en saison des pluies.', 1);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'plage', 'Kata Beach', 'Accès libre', 'Gratuit', 'Plage plus familiale et tranquille que Patong, bonne ambiance pour le coucher de soleil et le surf en saison.', '💡 Idéale en fin de journée pour un coucher de soleil moins fréquenté qu''à Patong.', 2);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'plage', 'Karon Beach', 'Accès libre', 'Gratuit', 'Longue plage de sable doré, plus calme que Patong, avec quelques restaurants en bord de mer.', 'ℹ️ Bon compromis entre tranquillité et proximité des commodités.', 3);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'plage', 'Freedom Beach', '9h00 - 18h00 (accès en bateau)', 'Bateau-taxi environ 150-200 THB/pers A/R', 'Petite crique isolée à l''eau turquoise, accessible uniquement en bateau depuis Patong ou à pied via un sentier escarpé.', 'ℹ️ Peu d''infrastructures sur place, prévoir eau et snacks.', 4);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'excursion_mer', 'Phi Phi Islands', 'Excursion journée, départ 8h00, retour vers 17h00', 'Environ 1500-2500 THB/pers selon formule (speedboat/longtail)', 'Excursion vers les célèbres îles Phi Phi : Maya Bay, Pileh Lagoon et plages de sable blanc entourées de falaises calcaires.', '💡 Privilégiez un départ très matinal pour éviter la foule à Maya Bay.
⚠️ Maya Bay impose des quotas et horaires de visite stricts, vérifiez les conditions actuelles.', 5);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'excursion_mer', 'James Bond Island (Phang Nga Bay)', 'Excursion journée, environ 8h00 - 16h00', 'Environ 1200-2000 THB/pers', 'Croisière dans la baie de Phang Nga parmi les pitons karstiques, avec arrêt sur l''île rendue célèbre par James Bond et balade en canoë dans les mangroves.', 'ℹ️ Le canoë dans les grottes/mangroves (« sea cave canoeing ») est souvent inclus.', 6);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'excursion_mer', 'Île de Coral / Racha', 'Excursion journée, environ 8h30 - 16h00', 'Environ 1000-1800 THB/pers', 'Îles aux eaux cristallines proches de Phuket, idéales pour le snorkeling et la baignade en toute tranquillité.', '💡 Bonne alternative plus proche et moins fréquentée que Phi Phi pour une demi-journée.', 7);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'temple_culture', 'Big Buddha Phuket', '6h00 - 19h00', 'Gratuit (don bienvenu)', 'Immense statue de Bouddha blanche de 45 mètres dominant le sud de l''île, avec vue panoramique à 360°.', 'ℹ️ Tenue correcte demandée (épaules/genoux couverts), des paréos sont prêtés à l''entrée.', 8);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'temple_culture', 'Wat Chalong', '7h00 - 17h00', 'Gratuit (don bienvenu)', 'Le plus grand et le plus vénéré des temples de Phuket, connu pour son stupa doré richement décoré.', 'ℹ️ Facilement combinable avec le Big Buddha, à environ 20 minutes de route.', 9);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'quartier', 'Phuket Old Town', 'Accessible toute la journée, ambiance en soirée le dimanche (marché)', 'Gratuit', 'Quartier historique aux façades sino-portugaises colorées, galeries d''art, cafés et street food.', '💡 Le dimanche soir, la Sunday Walking Street anime toute la rue principale.', 10);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'marche_shopping', 'Marché de nuit (Patong / Chillva)', '17h00 - 23h00', 'Gratuit', 'Marchés nocturnes proposant artisanat, vêtements, souvenirs et stands de street food dans une ambiance conviviale.', '💡 Chillva Market a une ambiance plus locale et créative, prisée des jeunes Thaïlandais.', 11);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'sport', 'Plongée / snorkeling', 'Sorties à la journée, départ matinal', 'Environ 2500-4500 THB selon spots et niveau', 'Phuket est un point de départ idéal pour explorer les récifs autour de Racha, Phi Phi ou Similan selon la saison.', 'ℹ️ Les îles Similan ne sont accessibles que d''octobre à mai (fermeture saisonnière).', 12);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'sport', 'Surf à Kata (saison)', 'Meilleure période mai-octobre (mousson, vagues plus fortes)', 'Location de planche environ 200-300 THB/h · cours dès 1000 THB', 'Kata et Kalim Beach sont les spots les plus populaires pour s''initier au surf pendant la mousson.', 'ℹ️ Hors saison (novembre-avril), la mer est généralement trop calme pour surfer.', 13);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'experience', 'Spectacle Phuket Fantasea', 'Soirée, spectacle vers 21h00 (buffet dès 18h00)', 'Environ 1700-2200 THB/pers (avec dîner)', 'Grand spectacle nocturne mêlant effets spéciaux, danses traditionnelles et même des éléphants sur scène.', '💡 Réservez à l''avance, le spectacle est très populaire en haute saison.', 14);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'nature_aventure', 'Karon Viewpoint (vue sur 3 plages)', 'Accessible toute la journée, idéal au coucher du soleil', 'Gratuit', 'Point de vue offrant un panorama sur trois baies (Kata, Kata Noi et Karon) en une seule photo.', '💡 Meilleure lumière en fin d''après-midi.', 15);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Phuket', 'experience', 'Cours de cuisine thaïe', 'Sessions de 3-4h, matin ou soir', 'Environ 1000-1500 THB/pers', 'Apprenez les bases de la cuisine thaïe du sud, réputée pour ses currys épicés et ses produits de la mer.', '💡 Demandez une formule avec visite de marché local pour découvrir les épices et ingrédients typiques.', 16);

-- Krabi (11 activités)
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'plage', 'Railay Beach', 'Accès en bateau uniquement depuis Ao Nang ou Krabi Town', 'Longtail boat environ 100-150 THB/trajet', 'Péninsule accessible uniquement par bateau, célèbre pour ses falaises calcaires spectaculaires et ses plages immaculées.', 'ℹ️ Pas de route carrossable : ambiance préservée et coupée du trafic.
💡 Railay East pour l''hébergement, Railay West pour le coucher de soleil.', 1);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'plage', 'Ao Nang Beach', 'Accès libre', 'Gratuit', 'Plage principale et animée de la région, point de départ de la plupart des excursions en bateau.', 'ℹ️ Nombreux restaurants, agences d''excursions et locations de scooters le long du front de mer.', 2);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'excursion_mer', 'Four Islands Tour', 'Excursion journée, environ 9h00 - 16h00', 'Environ 600-1000 THB/pers (longtail) · jusqu''à 1500 THB en speedboat', 'Tour classique reliant Tup Island, Chicken Island, Poda Island et Phra Nang Beach, snorkeling et plages de sable blanc.', '💡 La marée détermine si Tup Island est accessible à pied depuis Chicken Island (banc de sable temporaire).', 3);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'excursion_mer', 'Hong Islands Tour', 'Excursion journée, environ 8h30 - 16h00', 'Environ 800-1500 THB/pers', 'Excursion vers l''archipel de Koh Hong, lagons turquoise entourés de falaises et plages désertes.', 'ℹ️ Moins fréquenté que le Four Islands Tour, bonne option pour plus de tranquillité.', 4);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'nature_aventure', 'Tiger Cave Temple (Wat Tham Suea)', '7h00 - 17h00', 'Gratuit (don bienvenu, environ 20 THB parking)', 'Temple bouddhiste avec un escalier vertigineux de 1237 marches menant à un stupa doré offrant une vue à 360° sur la jungle.', '⚠️ Montée exigeante (environ 1h), prévoir beaucoup d''eau et partir tôt avant la chaleur.
💡 La vue au sommet récompense largement l''effort par temps clair.', 5);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'nature_aventure', 'Emerald Pool & Hot Springs', '8h30 - 17h00', 'Entrée parc environ 200 THB', 'Bassin naturel d''eau turquoise au cœur de la forêt tropicale, combiné avec des sources chaudes naturelles à proximité.', 'ℹ️ Les deux sites sont à environ 30 min l''un de l''autre, prévoyez la journée.
💡 Maillot de bain conseillé pour profiter des sources chaudes.', 6);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'sport', 'Escalade à Railay', 'Sessions demi-journée ou journée, le matin de préférence', 'Environ 1000-1500 THB (initiation demi-journée, équipement et moniteur inclus)', 'Railay est un spot mondialement connu pour l''escalade sur falaises calcaires surplombant la mer.', 'ℹ️ De nombreuses écoles proposent des initiations sans expérience préalable.', 7);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'sport', 'Plongée vers Koh Phi Phi depuis Krabi', 'Sorties à la journée, départ matinal', 'Environ 3000-4000 THB selon niveau et nombre de plongées', 'Krabi est un bon point de départ pour rejoindre les sites de plongée autour de Phi Phi et Koh Bida.', 'ℹ️ Niveaux débutant à avancé, certification PADI possible sur plusieurs jours.', 8);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'quartier', 'Marché de nuit de Krabi Town', '18h00 - 22h00', 'Gratuit', 'Marché de nuit local au bord de la rivière, ambiance authentique avec stands de street food thaïe.', '💡 Bon endroit pour goûter des plats locaux à petit prix loin de l''agitation touristique d''Ao Nang.', 9);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'nature_aventure', 'Mangrove kayak (Ao Thalane)', 'Sorties matinales ou en fin d''après-midi, environ 3h', 'Environ 1000-1500 THB/pers', 'Balade en kayak à travers les mangroves et lagons cachés entourés de falaises calcaires, calme et nature préservée.', '💡 La marée montante est idéale pour naviguer entre les arches rocheuses.', 10);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Krabi', 'excursion_mer', 'Koh Lanta day trip', 'Excursion journée ou nuitée', 'Transfert/ferry environ 300-500 THB · tours organisés dès 1500 THB', 'Île plus paisible au sud de Krabi, longues plages de sable, parc national et ambiance décontractée.', 'ℹ️ Accessible par ferry direct depuis Ao Nang en haute saison.', 11);

-- Koh Samui (14 activités)
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'plage', 'Chaweng Beach', 'Accès libre', 'Gratuit', 'La plage la plus longue et la plus animée de Koh Samui, bordée d''hôtels, restaurants et bars en bord de mer.', 'ℹ️ Vie nocturne concentrée à Chaweng Lake / Soi Green Mango.', 1);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'plage', 'Lamai Beach', 'Accès libre', 'Gratuit', 'Deuxième plage la plus animée de l''île, un peu plus calme et familiale que Chaweng.', 'ℹ️ À proximité, les rochers Hin Ta et Hin Yai valent le détour.', 2);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'nature_aventure', 'Cascade Na Muang', '8h00 - 17h00', 'Gratuit (parking quelques dizaines de THB)', 'Deux cascades successives (Na Muang 1 et 2) dans la jungle, avec bassins naturels pour se baigner.', '💡 Na Muang 2 demande une courte randonnée mais est nettement moins fréquentée.
⚠️ Rochers glissants autour des bassins, prévoir des chaussures adaptées.', 3);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'temple_culture', 'Big Buddha (Wat Phra Yai)', '6h00 - 18h00', 'Gratuit (don bienvenu)', 'Statue de Bouddha doré de 12 mètres de haut, sur un petit îlot relié à l''île par une jetée, visible de loin.', 'ℹ️ Tenue correcte demandée pour monter à la statue.', 4);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'temple_culture', 'Wat Plai Laem', '6h00 - 18h00', 'Gratuit (don bienvenu)', 'Temple coloré et photogénique avec une grande statue multi-bras (Guanyin) entourée d''un bassin.', '💡 À deux pas du Big Buddha, facile de combiner les deux sites.', 5);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'excursion_mer', 'Ang Thong Marine Park', 'Excursion journée, départ vers 8h00, retour vers 17h00', 'Environ 1500-2500 THB/pers selon speedboat ou bateau classique', 'Archipel de 42 îles karstiques avec lagon émeraude, point de vue panoramique et snorkeling en eaux cristallines.', '⚠️ La randonnée vers le point de vue du lagon (Mae Koh) est assez raide, environ 30-45 min de montée.
💡 Possibilité de kayak inclus dans certaines formules.', 6);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'excursion_mer', 'Excursion à Koh Tao / Koh Nang Yuan', 'Excursion journée, départ matinal en ferry/speedboat', 'Environ 1500-2500 THB/pers', 'Journée snorkeling/plongée vers Koh Tao et l''îlot voisin de Koh Nang Yuan, célèbre pour son banc de sable reliant trois îlots.', 'ℹ️ Trajet en mer relativement long (environ 1h30-2h), prévoir un anti-mal de mer si sensible.', 7);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'nature_aventure', 'Secret Buddha Garden (Magic Garden)', '7h00 - 17h00', 'Environ 80 THB', 'Jardin caché dans la montagne, parsemé de statues sculptées au fil des décennies par un fermier local, ambiance mystique.', '⚠️ Route d''accès en montagne escarpée, location de scooter/4x4 ou taxi recommandée.', 8);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'quartier', 'Fisherman''s Village (Bophut)', 'Accessible toute la journée, marché le vendredi soir 17h00-23h00', 'Gratuit', 'Ancien village de pêcheurs aux ruelles en bois reconverties en galeries, restaurants et boutiques chic, ambiance authentique.', '💡 Le « Fisherman''s Village Walking Street » a lieu chaque vendredi soir.', 9);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'marche_shopping', 'Marché de nuit de Chaweng', '18h00 - 23h00', 'Gratuit', 'Marché nocturne proposant souvenirs, vêtements et un large choix de street food thaïe.', '💡 Bon endroit pour dîner sur le pouce à petit prix.', 10);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'experience', 'Cours de cuisine thaïe', 'Sessions de 3-4h, matin ou après-midi', 'Environ 1200-1800 THB/pers', 'Apprenez à cuisiner des classiques thaïlandais dans une ambiance conviviale, souvent avec visite de marché local.', '💡 Certaines écoles proposent un transfert depuis votre hôtel.', 11);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'sport', 'Muay Thaï', 'Cours en journée · combats certains soirs (programmation variable)', 'Cours environ 400-600 THB · billets combats dès 800 THB', 'Plusieurs camps de l''île proposent initiation à la boxe thaïe ou soirées de combats dans des stades locaux.', 'ℹ️ Renseignez-vous sur place pour le calendrier des combats.', 12);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'experience', 'Spa traditionnel', '10h00 - 22h00 selon établissement', 'Environ 500-1500 THB selon soin', 'Koh Samui compte de nombreux spas, des instituts simples aux resorts haut de gamme proposant massages et soins traditionnels.', '💡 Les soins en fin d''après-midi avec vue sur mer sont particulièrement appréciés.', 13);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Samui', 'nature_aventure', 'Hin Ta Hin Yai (rochers grand-père/grand-mère)', 'Accessible toute la journée', 'Gratuit', 'Formations rocheuses naturelles à la forme suggestive, devenues une curiosité incontournable près de Lamai.', 'ℹ️ Petit marché de souvenirs et de snacks juste à côté.', 14);

-- Koh Tao (11 activités)
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'sport', 'Plongée / certification PADI', 'Cours sur plusieurs jours, sorties quotidiennes', 'Open Water environ 9000-11000 THB tout compris', 'Koh Tao est l''un des endroits les moins chers du monde pour apprendre à plonger, avec de nombreux centres certifiés.', '💡 Comparez les centres : hébergement souvent inclus ou à prix réduit avec le forfait plongée.
ℹ️ Niveaux débutant (Open Water) à avancé/instructeur disponibles.', 1);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'plage', 'Sairee Beach', 'Accès libre', 'Gratuit', 'Plage principale de l''île, longue bande de sable bordée de bars, restaurants et centres de plongée.', 'ℹ️ Animation en soirée avec bars de plage et feux de jongleurs.', 2);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'plage', 'Shark Bay', 'Accès libre', 'Gratuit', 'Petite baie tranquille au sud-est de l''île, propice au snorkeling, où l''on peut parfois observer des requins à pointe noire inoffensifs.', 'ℹ️ Accès par une piste depuis la route principale, scooter recommandé.', 3);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'excursion_mer', 'Koh Nang Yuan', 'Excursion demi-journée ou journée en bateau', 'Entrée île environ 100 THB + bateau environ 150-300 THB', 'Îlot emblématique relié par un banc de sable à deux autres îles, eaux turquoise idéales pour le snorkeling.', '💡 Très photogénique vu d''en haut, un petit sentier mène à un point de vue.', 4);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'nature_aventure', 'John-Suwan Viewpoint', '6h00 - 18h00', 'Environ 40-100 THB (accès via resort)', 'Point de vue emblématique offrant une vue sur deux baies opposées séparées par une langue de roche.', '💡 Idéal au lever ou au coucher du soleil.
⚠️ Sentier rocailleux et raide, chaussures fermées recommandées.', 5);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'nature_aventure', 'Randonnée vers Mango Bay viewpoint', 'Matin recommandé (chaleur)', 'Gratuit', 'Randonnée à travers la jungle jusqu''à un point de vue surplombant la baie turquoise de Mango Bay.', '⚠️ Sentier non balisé par endroits, prévoir beaucoup d''eau.', 6);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'sport', 'Snorkeling à Koh Nang Yuan / Mango Bay', 'Sorties à la demi-journée ou journée', 'Environ 500-1000 THB (location matériel + bateau)', 'Eaux peu profondes et claires, parfaites pour observer poissons tropicaux et coraux sans équipement de plongée.', 'ℹ️ Possibilité de louer masque/tuba directement sur la plage.', 7);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'quartier', 'Sairee Village (vie nocturne)', 'Animation en soirée jusqu''à minuit/1h', 'Gratuit (boissons dès 60 THB)', 'Le village principal de l''île le long de Sairee Beach, concentre bars, restaurants, magasins et agences de plongée.', '💡 Les spectacles de feu sur la plage attirent du monde en soirée.', 8);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'experience', 'Cours de cuisine thaïe', 'Sessions de 3h, en soirée généralement', 'Environ 800-1000 THB/pers', 'Petite école locale proposant l''apprentissage de plats classiques thaïlandais dans une ambiance détendue.', 'ℹ️ Format en petits groupes, ambiance conviviale.', 9);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'nature_aventure', 'Freedom Beach (Koh Tao)', 'Accès libre', 'Gratuit', 'Petite plage isolée au sud-ouest de l''île, accessible par un sentier, idéale pour le coucher de soleil loin de la foule.', '💡 Quelques bars de plage simples proposent transats et boissons.', 10);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Koh Tao', 'sport', 'Muay Thaï', 'Cours quotidiens, matin et fin d''après-midi', 'Environ 300-500 THB/séance ou forfaits semaine', 'Plusieurs camps proposent l''entraînement à la boxe thaïe pour tous niveaux, dans une ambiance motivante face à la mer.', 'ℹ️ Des forfaits hébergement + entraînement existent pour les séjours longs.', 11);

-- Ayutthaya (5 activités)
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Ayutthaya', 'temple_culture', 'Wat Mahathat', '8h00 - 18h00', 'Environ 50 THB (ou billet combiné parc historique)', 'Site emblématique abritant la fameuse tête de Bouddha enlacée par les racines d''un arbre, vestige de l''ancienne capitale du royaume du Siam.', '⚠️ Pour des raisons de respect, ne vous accroupissez pas plus haut que la tête de Bouddha pour la photo.', 1);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Ayutthaya', 'temple_culture', 'Wat Phra Si Sanphet', '8h00 - 18h00', 'Environ 50 THB', 'Ancien temple royal du palais, célèbre pour ses trois grands chedis (stupas) alignés en parfait état de conservation.', 'ℹ️ L''un des sites les plus photographiés du parc historique d''Ayutthaya (UNESCO).', 2);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Ayutthaya', 'temple_culture', 'Wat Chaiwatthanaram', '8h00 - 18h00', 'Environ 50 THB', 'Temple majestueux de style khmer en bord de rivière, particulièrement spectaculaire au coucher du soleil.', '💡 Idéal en fin de journée pour la lumière dorée sur les prangs en briques.', 3);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Ayutthaya', 'excursion_mer', 'Tour en bateau autour de l''île', 'Départs en fin de journée, durée environ 1h30-2h', 'Environ 50-200 THB/pers selon formule (bateau partagé ou privé)', 'Croisière sur les rivières entourant l''ancienne capitale, vue depuis l''eau sur plusieurs temples dont Wat Chaiwatthanaram.', '💡 Le coucher de soleil depuis le bateau offre une perspective unique sur les ruines.', 4);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Ayutthaya', 'marche_shopping', 'Marché flottant Ayothaya', '9h00 - 18h00', 'Entrée environ 100 THB (parfois avec bon d''achat inclus)', 'Marché flottant reconstitué en hommage à l''époque d''Ayutthaya, avec stands de nourriture, artisanat et spectacles culturels.', 'ℹ️ Plus touristique qu''authentique, mais agréable pour une pause en fin de visite des temples.', 5);

-- Chiang Rai (5 activités)
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Rai', 'temple_culture', 'Wat Rong Khun (Temple Blanc)', '8h00 - 17h00 (zone extérieure parfois accessible plus tôt)', 'Environ 100 THB (gratuit pour les Thaïlandais)', 'Temple contemporain spectaculaire entièrement blanc et orné de miroirs, à l''esthétique unique mêlant tradition bouddhiste et art moderne.', '⚠️ Photos interdites à l''intérieur du bâtiment principal.
💡 Arrivez tôt pour éviter la foule et la chaleur sur le pont d''accès.', 1);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Rai', 'temple_culture', 'Wat Rong Suea Ten (Temple Bleu)', '7h00 - 19h00', 'Gratuit (don bienvenu)', 'Temple aux couleurs bleu et or éclatantes, avec une grande statue de Bouddha blanc, plus récent et moins fréquenté que le Temple Blanc.', 'ℹ️ Facilement combinable avec le Temple Blanc dans la même demi-journée.', 2);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Rai', 'temple_culture', 'Baan Dam (Black House Museum)', '9h00 - 17h00', 'Environ 80 THB', 'Ensemble de pavillons noirs créés par l''artiste Thawan Duchanee, exposant une collection insolite d''os, de cornes et d''œuvres d''art sombres.', 'ℹ️ Ambiance radicalement différente du Temple Blanc, à découvrir en complément.', 3);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Rai', 'nature_aventure', 'Triangle d''Or (Golden Triangle)', 'Accessible toute la journée', 'Gratuit (musée de l''opium environ 200 THB en option)', 'Point de rencontre des frontières Thaïlande/Laos/Birmanie au confluent de deux rivières, ancien haut lieu du trafic d''opium, aujourd''hui zone de points de vue et de marchés.', 'ℹ️ Possibilité d''excursion en bateau sur le Mékong pour apercevoir les rives laotienne et birmane.', 4);
insert into public.activites (pays_code, ville, categorie, titre, horaires, tarifs, description, notes, ordre) values ('TH', 'Chiang Rai', 'marche_shopping', 'Marché de nuit de Chiang Rai', '18h00 - 23h00', 'Gratuit', 'Marché nocturne convivial avec scène de spectacles traditionnels, artisanat local et street food du nord.', '💡 Bonne option pour goûter la cuisine du nord (khao soi, sai ua) à petit prix.', 5);
