-- Core schema for HemiSync session management and storage
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can manage their profile"
on profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create table if not exists session_specs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null default 'Untitled Session',
  focus_level text not null default 'F12',
  spec jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table session_specs enable row level security;

create policy "Users can manage their specs"
on session_specs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references session_specs(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  spec_patch jsonb,
  created_at timestamptz not null default now()
);

alter table chat_messages enable row level security;

create index if not exists chat_messages_session_idx on chat_messages(session_id, created_at desc);

create policy "Users can view their session chat"
on chat_messages
for select
using (auth.uid() = user_id);

create policy "Users can insert their session chat"
on chat_messages
for insert
with check (auth.uid() = user_id);

create table if not exists renders (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references session_specs(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  bucket text not null,
  wav_path text,
  mp3_path text,
  status text not null default 'queued',
  error text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table renders enable row level security;

create index if not exists renders_session_idx on renders(session_id);

create policy "Users can manage their renders"
on renders
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'users-manage-render-buckets'
  ) then
    create policy "users-manage-render-buckets"
    on storage.objects
    for all
    using (
      bucket_id = concat('renders-', auth.uid())
    )
    with check (
      bucket_id = concat('renders-', auth.uid())
    );
  end if;
end
$$;


