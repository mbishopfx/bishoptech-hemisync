-- Member practice history and structured private reflection metadata.

create table if not exists public.member_practice_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed', 'skipped')),
  minutes integer not null default 0 check (minutes between 0 and 1440),
  target_minutes integer not null default 20 check (target_minutes between 5 and 60),
  session_id uuid references public.session_specs(id) on delete set null,
  note text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

alter table public.member_practice_days enable row level security;

drop policy if exists "Users can manage their member practice days" on public.member_practice_days;
create policy "Users can manage their member practice days"
on public.member_practice_days
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists member_practice_days_user_date_idx
  on public.member_practice_days(user_id, entry_date desc);

alter table public.journal_entries
  add column if not exists title text not null default 'Reflection',
  add column if not exists mood text,
  add column if not exists energy smallint not null default 3,
  add column if not exists focus_area text,
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists is_favorite boolean not null default false,
  add column if not exists analyzed_at timestamptz;

alter table public.journal_entries
  drop constraint if exists journal_entries_energy_check;

alter table public.journal_entries
  add constraint journal_entries_energy_check check (energy between 1 and 5);

create index if not exists journal_entries_user_updated_idx
  on public.journal_entries(user_id, updated_at desc);
