-- Demo seed voor één foodtruck.
-- Run schema.sql eerst.
-- Daarna: maak in Supabase Auth een gebruiker aan.
-- Vervang YOUR_AUTH_USER_ID door het ID van die gebruiker.

insert into public.businesses (
  slug, name, tagline, description, whatsapp, email, logo_url, color_primary, color_accent,
  location_title, location_address, location_maps_url, open_status, status_note, next_event_note, business_hours, instagram_url
) values (
  'bites-on-wheels',
  'Bites on Wheels',
  'Smash burgers · loaded fries · events',
  'Ambachtelijke streetfood, snel geserveerd en strak gepresenteerd. Live menu, actuele locatie en cateringaanvragen in één QR-pagina.',
  '31612345678',
  'hello@bitesonwheels.nl',
  '/assets/logo.svg',
  '#ff6b35',
  '#2ec4b6',
  'Foodtruck Festival Eindhoven',
  'Ketelhuisplein, 5617 AE Eindhoven',
  'https://maps.google.com/?q=Ketelhuisplein%20Eindhoven',
  'Vandaag open',
  'Open van 12:00 tot 21:00 · zolang de voorraad strekt.',
  'Vrijdag staan we op de borrelmarkt. Cateringaanvragen vanaf 40 personen mogelijk.',
  'Ma  gesloten
Di  gesloten
Wo  12:00 - 20:00
Do  12:00 - 20:00
Vr  12:00 - 22:00
Za  12:00 - 22:00
Zo  12:00 - 20:00',
  'https://instagram.com/'
) on conflict (slug) do update set name = excluded.name
returning id;

with b as (select id from public.businesses where slug = 'bites-on-wheels'),
cat1 as (
  insert into public.menu_categories (business_id, name, description, sort_order)
  select id, 'Burgers', 'Smashed, juicy en snel klaar.', 1 from b
  returning id
),
cat2 as (
  insert into public.menu_categories (business_id, name, description, sort_order)
  select id, 'Loaded fries', 'Friet met toppings.', 2 from b
  returning id
),
cat3 as (
  insert into public.menu_categories (business_id, name, description, sort_order)
  select id, 'Drinks', 'Koud en snel.', 3 from b
  returning id
)
insert into public.menu_items (business_id, category_id, name, description, price_cents, allergens, labels, is_featured, sort_order)
select b.id, cat1.id, 'Classic Smash', 'Dubbele smash patty, cheddar, pickles, onion jam en house sauce.', 1050, array['gluten','melk','ei'], array['hardloper'], true, 1 from b, cat1
union all
select b.id, cat1.id, 'Spicy Seoul Burger', 'Gochujang mayo, kimchi slaw, cheddar en crispy onions.', 1195, array['gluten','melk','sesam'], array['spicy'], true, 2 from b, cat1
union all
select b.id, cat2.id, 'Loaded BBQ Fries', 'Friet, pulled beef, BBQ glaze, cheddar sauce en jalapeño.', 895, array['melk'], array['populair'], true, 1 from b, cat2
union all
select b.id, cat3.id, 'Homemade Lemonade', 'Citroen, munt en bruiswater.', 350, array[]::text[], array['fris'], false, 1 from b, cat3;

-- Koppel de beheerder aan deze foodtruck:
-- update deze regel eerst met het echte auth.users.id
-- insert into public.business_users (business_id, user_id, role)
-- select id, 'YOUR_AUTH_USER_ID'::uuid, 'owner' from public.businesses where slug = 'bites-on-wheels';
