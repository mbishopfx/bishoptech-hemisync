-- Durable, revocable access grants for successful machine-payment receipts.
-- The raw grant is returned once to the paid caller; only its hash and an
-- encrypted recovery copy are stored here.
begin;

create table if not exists public.machine_session_grants (
  id uuid primary key default gen_random_uuid(),
  access_key_hash text not null unique,
  access_key_hint text not null,
  access_key_ciphertext text not null,
  payment_reference text not null unique,
  payment_method text not null default 'stripe',
  scope text not null,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revoked_reason text,
  last_used_at timestamptz,
  use_count integer not null default 0 check (use_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists machine_session_grants_expiry_idx
  on public.machine_session_grants(status, expires_at);

create index if not exists machine_session_grants_created_idx
  on public.machine_session_grants(created_at desc);

alter table public.machine_session_grants enable row level security;

-- No public or authenticated policies are defined. The server validates the
-- bearer grant and returns only bounded session metadata to the client.

commit;
