-- ============================================================
-- Corrige deux oublis de la migration 20240027 : la phrase
-- "niveau de vigilance" (Sécurité) et le détail sur la fièvre
-- jaune (Santé) n'avaient pas été repris du PDF source.
-- ============================================================

update public.pays set
  infos_securite = 'La grande majorité des zones touristiques sont sûres et fréquentées sans souci par des millions de voyageurs chaque année, mais des risques existent dans certaines zones. Surveillez vos effets personnels dans les lieux très touristiques, évitez les taxis non officiels et respectez strictement les lois locales (notamment concernant la famille royale et les stupéfiants, dont les sanctions sont très sévères).',

  vaccins_recommandes = 'Aucun vaccin obligatoire, sauf fièvre jaune si arrivée depuis un pays où elle est présente (certificat exigé), ou en cas de transit de plus de 12h dans un pays endémique (Afrique subsaharienne, Guyane française, Brésil, Colombie...). Recommandés : Hépatite A. Hépatite B (séjours prolongés). Typhoïde (séjour rural ou long). Rage si activités à risque ou séjour isolé. Les recommandations peuvent évoluer : consultez le site de l''Institut Pasteur, idéalement 4 à 6 semaines avant le départ.'

where code = 'TH';
