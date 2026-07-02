-- Foodtruck Control - Supabase schema
-- Run dit bestand in Supabase SQL Editor.
-- Daarna maak je een Auth user aan en koppel je die in business_users.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  whatsapp text,
  email text,
  logo_url text,
  hero_image_url text,
  color_primary text default '#ff6b35',
  color_accent text default '#2ec4b6',
  location_title text,
  location_address text,
  location_maps_url text,
  open_status text default 'Vandaag open',
  status_note text,
  next_event_note text,
  business_hours text,
  instagram_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  allergens text[] not null default '{}',
  labels text[] not null default '{}',
  image_url text,
  is_sold_out boolean not null default false,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catering_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text not null,
  phone text not null,
  email text,
  event_date date,
  location text,
  guest_count integer,
  event_type text,
  menu_preference text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_businesses_updated_at on public.businesses;
create trigger trg_businesses_updated_at before update on public.businesses for each row execute function public.touch_updated_at();

drop trigger if exists trg_menu_categories_updated_at on public.menu_categories;
create trigger trg_menu_categories_updated_at before update on public.menu_categories for each row execute function public.touch_updated_at();

drop trigger if exists trg_menu_items_updated_at on public.menu_items;
create trigger trg_menu_items_updated_at before update on public.menu_items for each row execute function public.touch_updated_at();

drop trigger if exists trg_catering_requests_updated_at on public.catering_requests;
create trigger trg_catering_requests_updated_at before update on public.catering_requests for each row execute function public.touch_updated_at();

create or replace function public.is_business_member(target_business_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.business_users bu
    where bu.business_id = target_business_id
    and bu.user_id = auth.uid()
  );
$$;

alter table public.businesses enable row level security;
alter table public.business_users enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.catering_requests enable row level security;

-- Public read: alleen actieve foodtrucks en actieve menu-informatie.
drop policy if exists "Public can read active businesses" on public.businesses;
create policy "Public can read active businesses" on public.businesses
for select using (is_active = true);

drop policy if exists "Members can update own business" on public.businesses;
create policy "Members can update own business" on public.businesses
for update using (public.is_business_member(id)) with check (public.is_business_member(id));

drop policy if exists "Members can read memberships" on public.business_users;
create policy "Members can read memberships" on public.business_users
for select using (user_id = auth.uid());

drop policy if exists "Public can read categories for active businesses" on public.menu_categories;
create policy "Public can read categories for active businesses" on public.menu_categories
for select using (exists (select 1 from public.businesses b where b.id = business_id and b.is_active = true));

drop policy if exists "Members can manage categories" on public.menu_categories;
create policy "Members can manage categories" on public.menu_categories
for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

drop policy if exists "Public can read active menu items" on public.menu_items;
create policy "Public can read active menu items" on public.menu_items
for select using (
  is_active = true and exists (select 1 from public.businesses b where b.id = business_id and b.is_active = true)
);

drop policy if exists "Members can manage menu items" on public.menu_items;
create policy "Members can manage menu items" on public.menu_items
for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

drop policy if exists "Public can create catering requests" on public.catering_requests;
create policy "Public can create catering requests" on public.catering_requests
for insert with check (exists (select 1 from public.businesses b where b.id = business_id and b.is_active = true));

drop policy if exists "Members can read requests" on public.catering_requests;
create policy "Members can read requests" on public.catering_requests
for select using (public.is_business_member(business_id));

drop policy if exists "Members can update requests" on public.catering_requests;
create policy "Members can update requests" on public.catering_requests
for update using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

create index if not exists idx_businesses_slug on public.businesses(slug);
create index if not exists idx_menu_categories_business on public.menu_categories(business_id, sort_order);
create index if not exists idx_menu_items_business on public.menu_items(business_id, is_active, sort_order);
create index if not exists idx_catering_requests_business on public.catering_requests(business_id, created_at desc);
