-- ============================================================
-- Remplace intégralement le contenu de l'onglet Infos pour la
-- Thaïlande par les données à jour (source : fiche pays fournie).
--
-- Garde-fou : certaines colonnes d'enrichissement (migrations
-- 20240004/20240008) n'ont visiblement jamais été appliquées sur
-- cette base — on les (re)crée ici si besoin avant de les remplir.
-- ============================================================

alter table public.pays
  add column if not exists liens_officiels jsonb default '[]',
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

update public.pays set
  niveau_securite = 'orange',
  infos_securite = 'Surveillez vos effets personnels dans les lieux très touristiques, évitez les taxis non officiels et respectez strictement les lois locales (notamment concernant la famille royale et les stupéfiants, dont les sanctions sont très sévères).',

  zones_deconseillees = '[
    {"zone": "Provinces de Narathiwat, Pattani, Yala et le sud de Songkhla (frontière avec la Malaisie)", "niveau": "rouge", "note": "Déplacements formellement déconseillés."}
  ]'::jsonb,

  visa_requis_france = false,
  visa_details = 'Pas de visa pour un séjour touristique jusqu''à 60 jours (susceptible de revenir à 30 jours, vérifier avant le départ). Visa obligatoire au-delà. Pour un séjour supérieur à 60 jours, l''obtention d''un visa est obligatoire : les visas touristiques sont délivrés non pas en Thaïlande mais par les consulats de Thaïlande à l''étranger, et la procédure prend environ 4 semaines (voire plus si le dossier est incomplet).',

  entree_details = '{
    "duree_max_sans_visa": "60 jours pour un séjour touristique (peut revenir à 30 jours selon les accords en vigueur — à vérifier avant le départ)",
    "prolongation": null,
    "validite_passeport": "Valable au moins 6 mois à compter de la date d''entrée sur le territoire. Le passeport ne doit pas être déchiré ou abîmé, sous peine de se voir refuser l''entrée sur le territoire thaïlandais sans intervention possible de l''ambassade. Au moins 1 page vierge est recommandée pour les tampons d''entrée et de sortie.",
    "billet_retour": null,
    "preuve_fonds": null,
    "formulaire_arrivee": {
      "nom": "TDAC (Thailand Digital Arrival Card)",
      "obligatoire": true,
      "delai": "À remplir en ligne dans les 3 jours précédant l''arrivée",
      "lien": "https://tdac.immigration.go.th/arrival-card/#/home",
      "note": null
    }
  }'::jsonb,

  vaccins_recommandes = 'Hépatite A. Hépatite B (séjours prolongés). Typhoïde (séjour rural ou long). Rage si activités à risque ou séjour isolé. Les recommandations peuvent évoluer : consultez le site de l''Institut Pasteur, idéalement 4 à 6 semaines avant le départ.',

  sante_details = '{
    "paludisme": null,
    "dengue": "La dengue est présente partout en Thaïlande, y compris dans les villes ; il n''y a pas de vaccin disponible pour les voyageurs. Protection avec du répulsif DEET 20% minimum et des vêtements couvrants au coucher du soleil.",
    "eau": "L''eau du robinet n''est pas potable, l''eau en bouteille est obligatoire y compris pour le lavage de dents. Les glaçons avec un trou au centre sont généralement industriels et peuvent être consommés sans risque.",
    "trousse_medicale": []
  }'::jsonb,

  assurance_info = 'Fortement recommandée. La Sécu française ne rembourse rien hors UE alors que les frais médicaux et d''hospitalisation peuvent être élevés (peut atteindre 50 000€). Les cartes bancaires premium sont souvent insuffisantes au-delà de 30 jours et excluent la conduite de scooter. Une assurance couvrant les soins et le rapatriement est conseillée.',

  douane_infos = 'À l''aller : l''importation de cigarettes est limitée à 200 cigarettes (10 paquets de 20) par passager majeur. L''importation de drogues est passible de peines très lourdes, dont la peine de mort. L''importation d''alcool est limitée à un litre par personne. Les cigarettes électroniques et tous produits similaires sont interdits en Thaïlande (importation, vente et usage peuvent être sanctionnés) : le contrevenant s''expose à une amende de 12 700€ et à une peine de prison de 5 ans. L''exportation de statues du Bouddha est strictement prohibée. Au retour : l''exportation d''alcool est limitée à un litre par personne, et l''exportation de cigarettes à 200 cigarettes (10 paquets de 20) par passager majeur.',

  reseau_mobile_info = 'Avant le départ : une eSIM est recommandée (Airalo, Holafly, Nomad). Sur place : les cartes SIM locales AIS, True et DTAC offrent une excellente couverture et sont disponibles dès l''aéroport.',

  urgence_police = '191',
  urgence_ambulance = '1669',
  urgence_ambassade_france = '+66 2 657 5100',
  urgence_autres = '[]'::jsonb,

  devise = 'Baht thaïlandais (THB)',
  symbole_devise = '฿',
  argent_notes = 'Carte bancaire acceptée dans la majorité des hôtels, centres commerciaux et restaurants. Prévoir des espèces pour les marchés, petits commerces et certaines îles.',

  type_prise_electrique = 'Type A, B, C et O · 220V/50Hz — un adaptateur est parfois nécessaire selon vos appareils.',

  liens_officiels = '[
    {"label": "Trouver votre visa correspondant", "url": "https://www.thaiembassy.fr/fr/visa-rdv/les-types-de-visa-et-les-documents-necessaires/visa-touristique/", "type": "visa"},
    {"label": "Consulter les conseils de l''Institut Pasteur", "url": "https://www.pasteur.fr/fr/centre-medical/preparer-son-voyage/thailande", "type": "sante"},
    {"label": "Consulter la douane française", "url": "https://www.douane.gouv.fr/quest-ce-qui-est-autorise-interdit-en-avion", "type": "douane"}
  ]'::jsonb

where code = 'TH';
