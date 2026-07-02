-- Foodtruck/Fishmonger Control schema
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  subtitle text,
  phone text,
  whatsapp text,
  email text,
  address text,
  description text,
  status_label text,
  status_note text,
  created_at timestamptz default now()
);

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz default now(),
  unique(user_id, business_id)
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price_label text,
  tags text[] default '{}',
  available boolean default true,
  highlighted boolean default false,
  active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_label text not null,
  time_label text,
  place text not null,
  address text,
  map_url text,
  active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.catering_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  request_type text,
  name text,
  phone text,
  email text,
  event_date date,
  people integer,
  notes text,
  status text default 'nieuw',
  created_at timestamptz default now()
);

alter table public.businesses enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.locations enable row level security;
alter table public.catering_requests enable row level security;

create or replace function public.is_business_admin(target_business uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid()
      and business_id = target_business
  );
$$;


-- Re-run safe: remove existing policies before recreating them.
drop policy if exists "public read businesses" on public.businesses;
drop policy if exists "public read categories" on public.menu_categories;
drop policy if exists "public read menu items" on public.menu_items;
drop policy if exists "public read locations" on public.locations;
drop policy if exists "public insert requests" on public.catering_requests;
drop policy if exists "admin read profiles" on public.admin_profiles;
drop policy if exists "admin update business" on public.businesses;
drop policy if exists "admin manage categories" on public.menu_categories;
drop policy if exists "admin manage menu" on public.menu_items;
drop policy if exists "admin manage locations" on public.locations;
drop policy if exists "admin manage requests" on public.catering_requests;

-- Public read policies
create policy "public read businesses" on public.businesses for select using (true);
create policy "public read categories" on public.menu_categories for select using (true);
create policy "public read menu items" on public.menu_items for select using (true);
create policy "public read locations" on public.locations for select using (true);

-- Public can create requests
create policy "public insert requests" on public.catering_requests for insert with check (true);

-- Admin read/update policies
create policy "admin read profiles" on public.admin_profiles for select using (auth.uid() = user_id);
create policy "admin update business" on public.businesses for update using (public.is_business_admin(id)) with check (public.is_business_admin(id));
create policy "admin manage categories" on public.menu_categories for all using (public.is_business_admin(business_id)) with check (public.is_business_admin(business_id));
create policy "admin manage menu" on public.menu_items for all using (public.is_business_admin(business_id)) with check (public.is_business_admin(business_id));
create policy "admin manage locations" on public.locations for all using (public.is_business_admin(business_id)) with check (public.is_business_admin(business_id));
create policy "admin manage requests" on public.catering_requests for all using (public.is_business_admin(business_id)) with check (public.is_business_admin(business_id));
