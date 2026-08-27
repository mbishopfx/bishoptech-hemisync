-- Agent-assisted commerce, UCP checkout state, and expiring workshop access.
-- These tables are intentionally service-role only. Public MCP callers receive
-- catalog metadata, hosted checkout URLs, or short-lived bearer links; they do
-- not receive database access or payment credentials.
begin;

create extension if not exists "pgcrypto";

create table if not exists public.agent_checkout_requests (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  request_hash text not null,
  product_type text not null check (product_type in ('tone-pack', 'workshop-24h')),
  product_slug text not null,
  purchaser_email_hash text,
  stripe_session_id text,
  status text not null default 'pending' check (status in ('pending', 'created', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists agent_checkout_requests_stripe_session_unique
  on public.agent_checkout_requests(stripe_session_id)
  where stripe_session_id is not null;

create index if not exists agent_checkout_requests_created_idx
  on public.agent_checkout_requests(created_at desc);

create table if not exists public.workshop_access_keys (
  id uuid primary key default gen_random_uuid(),
  access_key_hash text not null unique,
  access_key_hint text not null,
  access_key_ciphertext text not null,
  user_id uuid,
  purchaser_email text,
  stripe_session_id text not null unique,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  price_id text not null default '',
  status text not null default 'active' check (status in ('pending', 'active', 'expired', 'revoked')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revoked_reason text,
  email_sent_at timestamptz,
  email_error text,
  last_used_at timestamptz,
  use_count integer not null default 0 check (use_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workshop_access_keys_user_idx
  on public.workshop_access_keys(user_id, created_at desc);

create index if not exists workshop_access_keys_expiry_idx
  on public.workshop_access_keys(status, expires_at);

create table if not exists public.commerce_checkouts (
  id text primary key,
  idempotency_key text not null unique,
  request_hash text not null default '',
  status text not null default 'incomplete' check (status in ('incomplete', 'ready_for_complete', 'requires_escalation', 'completed', 'canceled', 'expired')),
  currency text not null default 'usd',
  line_items jsonb not null default '[]'::jsonb,
  totals jsonb not null default '{}'::jsonb,
  buyer jsonb not null default '{}'::jsonb,
  payment jsonb not null default '{}'::jsonb,
  completion_idempotency_key text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  order_id text,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  completed_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commerce_checkouts_status_idx
  on public.commerce_checkouts(status, updated_at desc);

create table if not exists public.commerce_orders (
  id text primary key,
  checkout_id text not null unique references public.commerce_checkouts(id) on delete restrict,
  status text not null default 'created' check (status in ('created', 'paid', 'fulfilled', 'refunded', 'disputed', 'canceled')),
  currency text not null default 'usd',
  line_items jsonb not null default '[]'::jsonb,
  totals jsonb not null default '{}'::jsonb,
  payment jsonb not null default '{}'::jsonb,
  fulfillment jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commerce_webhook_events (
  event_id text primary key,
  provider text not null,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'received' check (status in ('received', 'processing', 'processed', 'failed')),
  error text,
  payload_hash text
);

create table if not exists public.ap2_mandates (
  mandate_id text primary key,
  checkout_id text not null references public.commerce_checkouts(id) on delete restrict,
  agent_key_id text not null,
  cart_hash text not null,
  currency text not null,
  amount_max integer not null check (amount_max > 0),
  expires_at timestamptz not null,
  signature_hash text not null,
  status text not null default 'reserved' check (status in ('reserved', 'consumed', 'expired', 'revoked')),
  payment_reference text,
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists ap2_mandates_checkout_idx
  on public.ap2_mandates(checkout_id, created_at desc);

create index if not exists ap2_mandates_expiry_idx
  on public.ap2_mandates(status, expires_at);

alter table public.agent_checkout_requests enable row level security;
alter table public.workshop_access_keys enable row level security;
alter table public.commerce_checkouts enable row level security;
alter table public.commerce_orders enable row level security;
alter table public.commerce_webhook_events enable row level security;
alter table public.ap2_mandates enable row level security;

-- No public or authenticated policies are defined for these tables. Server
-- routes use the Supabase service role and redact payment/access data at the
-- MCP boundary.

commit;
