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

create index if not exists idx_tone_packs_published on public.tone_packs(published, updated_at desc);

alter table public.tone_pack_purchases
  alter column user_id drop not null;

alter table public.tone_pack_purchases
  add column if not exists purchaser_email text,
  add column if not exists bundle_url text,
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_error text,
  add column if not exists download_count integer not null default 0;

create index if not exists idx_tone_pack_purchases_email on public.tone_pack_purchases(purchaser_email);
create index if not exists idx_tone_pack_purchases_session on public.tone_pack_purchases(stripe_session_id);

alter table public.tone_pack_tracks
  add column if not exists source_tone_id text,
  add column if not exists source_url text,
  add column if not exists file_extension text not null default 'webm';

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
