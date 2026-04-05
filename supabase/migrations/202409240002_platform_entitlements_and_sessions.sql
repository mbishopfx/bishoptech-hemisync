-- Production platform scaffolding: entitlements, session logging, and community sharing
create extension if not exists "pgcrypto";

alter table profiles
  add column if not exists plan text not null default 'free',
  add column if not exists free_saved_generations_used integer not null default 0,
  add column if not exists free_saved_generations_limit integer not null default 1,
  add column if not exists session_count integer not null default 0,
  add column if not exists last_session_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table profiles
  add constraint profiles_plan_check check (plan in ('free', 'pro', 'founder'));

create table if not exists session_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  session_id uuid references session_specs(id) on delete cascade,
  render_id uuid references renders(id) on delete cascade,
  event_type text not null check (event_type in ('generated', 'preview_played', 'saved', 'favorite', 'completed', 'shared', 'rated')),
  duration_sec integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table session_logs enable row level security;
create index if not exists session_logs_user_idx on session_logs(user_id, created_at desc);
create index if not exists session_logs_session_idx on session_logs(session_id, created_at desc);

create policy "Users can manage their session logs"
on session_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists shared_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  session_id uuid references session_specs(id) on delete cascade,
  title text not null,
  description text,
  visibility text not null default 'private' check (visibility in ('private', 'unlisted', 'public')),
  slug text unique,
  share_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table shared_sessions enable row level security;
create index if not exists shared_sessions_user_idx on shared_sessions(user_id, created_at desc);
create policy "Users can manage their shared sessions"
on shared_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists shared_session_comments (
  id uuid primary key default gen_random_uuid(),
  shared_session_id uuid not null references shared_sessions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table shared_session_comments enable row level security;
create index if not exists shared_session_comments_session_idx on shared_session_comments(shared_session_id, created_at asc);
create policy "Users can manage their shared session comments"
on shared_session_comments
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists session_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  session_id uuid references session_specs(id) on delete cascade,
  shared_session_id uuid references shared_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint session_favorites_target_check check (
    (session_id is not null and shared_session_id is null)
    or (session_id is null and shared_session_id is not null)
  )
);

alter table session_favorites enable row level security;
create index if not exists session_favorites_user_idx on session_favorites(user_id, created_at desc);
create policy "Users can manage their favorites"
on session_favorites
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
