-- Multi-pack catalog and accountless delivery support.
create extension if not exists "pgcrypto";

create table if not exists public.tone_packs (
  slug text primary key,
  name text not null,
  price_id text not null,
  price_cents integer not null default 599,
  duration_sec integer not null default 3000,
  track_count integer not null default 0,
  description text not null default '',
  summary text not null default '',
  states text[] not null default '{}',
  bundle_url text,
  published boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tone_pack_tracks (
  pack_slug text not null references public.tone_packs(slug) on delete cascade,
  track_id text not null,
  pack_name text not null default '',
  track_name text not null default '',
  short_label text,
  state text,
  target_state text,
  target_hz numeric,
  base_freq_hz numeric,
  duration_sec integer not null default 0,
  preview_seconds integer not null default 30,
  preview_url text,
  download_url text,
  file_name text,
  sort_order integer not null default 0,
  source_tone_id text,
  source_url text,
  file_extension text not null default 'webm',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (pack_slug, track_id)
);

create table if not exists public.tone_pack_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  pack_slug text not null,
  pack_name text not null default '',
  purchaser_email text,
  price_id text not null default '',
  stripe_session_id text not null,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  bundle_url text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  email_sent_at timestamptz,
  email_error text,
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bring older installations up to the same shape without replacing existing data.
alter table public.tone_pack_tracks
  add column if not exists pack_name text not null default '',
  add column if not exists track_name text not null default '',
  add column if not exists short_label text,
  add column if not exists state text,
  add column if not exists target_state text,
  add column if not exists target_hz numeric,
  add column if not exists base_freq_hz numeric,
  add column if not exists duration_sec integer not null default 0,
  add column if not exists preview_seconds integer not null default 30,
  add column if not exists preview_url text,
  add column if not exists download_url text,
  add column if not exists file_name text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists source_tone_id text,
  add column if not exists source_url text,
  add column if not exists file_extension text not null default 'webm',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.tone_pack_purchases
  add column if not exists user_id uuid,
  add column if not exists pack_slug text,
  add column if not exists pack_name text not null default '',
  add column if not exists purchaser_email text,
  add column if not exists price_id text not null default '',
  add column if not exists stripe_session_id text,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists bundle_url text,
  add column if not exists status text not null default 'active',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_error text,
  add column if not exists download_count integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.tone_pack_purchases
  alter column user_id drop not null;

create index if not exists idx_tone_packs_published on public.tone_packs(published, updated_at desc);
create index if not exists idx_tone_pack_tracks_pack on public.tone_pack_tracks(pack_slug, sort_order);
create index if not exists idx_tone_pack_purchases_email on public.tone_pack_purchases(purchaser_email);
create index if not exists idx_tone_pack_purchases_session on public.tone_pack_purchases(stripe_session_id);
create unique index if not exists idx_tone_pack_tracks_pack_track on public.tone_pack_tracks(pack_slug, track_id);
create unique index if not exists idx_tone_pack_purchases_session_unique on public.tone_pack_purchases(stripe_session_id);

alter table public.tone_packs enable row level security;
alter table public.tone_pack_tracks enable row level security;
alter table public.tone_pack_purchases enable row level security;

-- Public catalog rows are safe to browse; ownership remains server-only.
drop policy if exists "Public can view published tone packs" on public.tone_packs;
create policy "Public can view published tone packs"
  on public.tone_packs for select
  using (published = true);

drop policy if exists "Public can view tone pack tracks" on public.tone_pack_tracks;
create policy "Public can view tone pack tracks"
  on public.tone_pack_tracks for select
  using (true);

-- Purchases are written and read by the service role from server routes only.
