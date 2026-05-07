create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  session_id uuid references session_specs(id) on delete set null,
  text text not null,
  summary text,
  intent text,
  sentiment text,
  cognitive_shifts text,
  ai_insights jsonb,
  safety jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table journal_entries enable row level security;
create index if not exists journal_entries_user_idx on journal_entries(user_id, created_at desc);

create policy "Users can manage their journal entries"
on journal_entries
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);