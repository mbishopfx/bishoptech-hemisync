begin;

create table if not exists public.ios_waitlist (
  email text primary key check (email = lower(email)),
  source text not null default 'homepage',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ios_waitlist enable row level security;

commit;
