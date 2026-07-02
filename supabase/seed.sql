-- Seed data for Vishandel De Beer demo/live base.
-- Run after schema.sql.

insert into public.businesses (slug, name, subtitle, phone, whatsapp, email, address, description, status_label, status_note)
values (
  'vishandel-de-beer',
  'Vishandel De Beer',
  'Dagverse vis uit de kraam',
  '06 22479902',
  '31622479902',
  'vishandeldebeer@live.nl',
  'Rogier Monicxlaan 16, 5741ES Beek en Donk',
  'Bekijk het actuele assortiment, de standplaatsen en vraag snel een schotel of reservering aan.',
  'Live menu actief',
  'Assortiment en beschikbaarheid kunnen per dag wisselen. Bel of app gerust voor zekerheid.'
)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  address = excluded.address,
  description = excluded.description,
  status_label = excluded.status_label,
  status_note = excluded.status_note;

do $$
declare
  b uuid;
  cat_gebakken uuid;
  cat_vers uuid;
  cat_schaal uuid;
  cat_gerookt uuid;
  cat_klaar uuid;
  cat_schotels uuid;
begin
  select id into b from public.businesses where slug = 'vishandel-de-beer';

  insert into public.menu_categories (business_id, name, description, display_order) values
    (b, 'Gebakken vis', 'Warm uit de kraam', 1),
    (b, 'Verse vis', 'Dagvers assortiment', 2),
    (b, 'Schaal & schelp', 'Garnalen, mosselen en meer', 3),
    (b, 'Gerookt & gestoomd', 'Ambachtelijk bereid', 4),
    (b, 'Kant-en-klaar', 'Maaltijden en lunch', 5),
    (b, 'Schotels', 'Voor borrel, lunch of feest', 6);

  select id into cat_gebakken from public.menu_categories where business_id = b and name = 'Gebakken vis';
  select id into cat_vers from public.menu_categories where business_id = b and name = 'Verse vis';
  select id into cat_schaal from public.menu_categories where business_id = b and name = 'Schaal & schelp';
  select id into cat_gerookt from public.menu_categories where business_id = b and name = 'Gerookt & gestoomd';
  select id into cat_klaar from public.menu_categories where business_id = b and name = 'Kant-en-klaar';
  select id into cat_schotels from public.menu_categories where business_id = b and name = 'Schotels';

  insert into public.menu_items (business_id, category_id, name, description, price_label, tags, available, highlighted, active, display_order) values
    (b, cat_gebakken, 'Kibbeling', 'Vers gebakken vis, ideaal voor lunch of onderweg.', 'Dagprijs', array['warm','populair'], true, true, true, 1),
    (b, cat_klaar, 'Vissoep van Pierre', 'Rijk gevulde vissoep. Verkrijgbaar in halve en hele liters.', 'Vraag in de kraam', array['bestseller','kan in de vriezer'], true, true, true, 2),
    (b, cat_klaar, 'Zalmpotje', 'Tagliatelle met verse spinazie en zalm in hollandaisesaus.', 'Vraag in de kraam', array['maaltijd','oven'], true, false, true, 3),
    (b, cat_vers, 'Kabeljauwfilet', 'Verse filet uit het standaard assortiment. Beschikbaarheid wisselt per dag.', 'Dagprijs', array['vers'], true, false, true, 4),
    (b, cat_vers, 'Zalmfilet', 'Dagverse zalmfilet.', 'Dagprijs', array['vers'], true, false, true, 5),
    (b, cat_schaal, 'Hollandse garnalen', 'Hollandse, Noorse en party garnalen afhankelijk van voorraad.', 'Dagprijs', array['garnalen'], true, false, true, 6),
    (b, cat_gerookt, 'Gerookte palingfilet', 'Ambachtelijk gerookt. Per 100 gram verkrijgbaar.', 'Per 100 gram', array['gerookt'], true, false, true, 7),
    (b, cat_schotels, 'Luxe vis-hapjes schotel', 'Met o.a. gerookte zalmfilet, palingfilet, forelfilet, garnalen, makreel en salade. Vanaf 2 personen.', '€ 22,50 p.p.', array['vanaf 2 personen','borrel'], true, true, true, 8),
    (b, cat_schotels, 'Gourmet schotel', 'Rijk gevulde schaal met minimaal zeven verschillende vissoorten. Vanaf 2 personen.', '€ 15,- p.p.', array['gourmet','vanaf 2 personen'], true, false, true, 9),
    (b, cat_schotels, 'Haring schotel', 'Minimaal 10 haringen. Heel, gehalveerd of in vieren gesneden, met uitjes.', 'Dagprijs + €5 opmaak', array['min. 10 haringen'], true, false, true, 10);

  insert into public.locations (business_id, day_label, time_label, place, address, active, display_order) values
    (b, 'Woensdag', '09:00 - 13:00', 'Beek en Donk', 'Weekmarkt', true, 1),
    (b, 'Woensdag', '15:00 - 18:00', 'De Mortel', 'Bij De Sprank', true, 2),
    (b, 'Donderdag', '10:00 - 18:00', 'Stiphout', 'Bij de kerk', true, 3),
    (b, 'Donderdag', '10:00 - 18:00', 'Beek en Donk', 'Piet van Thielplein', true, 4),
    (b, 'Vrijdag', '10:00 - 18:00', 'Beek en Donk', 'Heuvelplein', true, 5),
    (b, 'Vrijdag', '10:00 - 18:00', 'Lieshout', 'Jumbo', true, 6),
    (b, 'Zaterdag', '09:00 - 14:00', 'Aarle-Rixtel', 'Bij de kerk', true, 7),
    (b, 'Zaterdag', '09:00 - 16:00', 'Stiphout', 'Bij de kerk', true, 8),
    (b, 'Zaterdag', '15:15 - 17:30', 'Beek en Donk', 'Piet van Thielplein', true, 9);
end $$;
