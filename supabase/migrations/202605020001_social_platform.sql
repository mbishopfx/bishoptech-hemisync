-- HemiSync member platform: profiles, social feed, saved tones, and tone artwork.
create extension if not exists "pgcrypto";

alter table profiles
  add column if not exists username text,
  add column if not exists display_name text,
  add column if not exists bio text,
  add column if not exists cover_url text,
  add column if not exists website_url text,
  add column if not exists x_url text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url text,
  add column if not exists tiktok_url text,
  add column if not exists profile_visibility text not null default 'public',
  add column if not exists onboarding_complete boolean not null default false;

create unique index if not exists profiles_username_unique_idx
  on profiles (lower(username))
  where username is not null and username <> '';

alter table profiles
  drop constraint if exists profiles_visibility_check;

alter table profiles
  add constraint profiles_visibility_check
  check (profile_visibility in ('public', 'members', 'private'));

create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_not_self_check check (follower_id <> following_id)
);

alter table follows enable row level security;

create policy "Members can view follows"
on follows for select
using (auth.uid() is not null);

create policy "Members can manage their follows"
on follows for all
using (auth.uid() = follower_id)
with check (auth.uid() = follower_id);

create table if not exists saved_tones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  source_session_id uuid references session_specs(id) on delete set null,
  render_id uuid references renders(id) on delete set null,
  name text not null,
  description text,
  cover_image_url text,
  target_state text check (target_state in ('delta', 'theta', 'alpha', 'beta', 'gamma')),
  frequency_plan jsonb not null default '{}'::jsonb,
  duration_sec integer,
  base_freq_hz numeric,
  delta_path jsonb not null default '[]'::jsonb,
  wav_url text,
  mp3_url text,
  artifact_id text,
  visibility text not null default 'private' check (visibility in ('private', 'unlisted', 'public')),
  use_count integer not null default 0,
  like_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table saved_tones enable row level security;
create index if not exists saved_tones_user_idx on saved_tones(user_id, created_at desc);
create index if not exists saved_tones_public_idx on saved_tones(visibility, created_at desc);

create policy "Members can view visible tones"
on saved_tones for select
using (visibility in ('public', 'unlisted') or auth.uid() = user_id);

create policy "Members can manage their saved tones"
on saved_tones for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists tone_likes (
  tone_id uuid not null references saved_tones(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tone_id, user_id)
);

alter table tone_likes enable row level security;
create policy "Members can view tone likes"
on tone_likes for select
using (auth.uid() is not null);
create policy "Members can manage their tone likes"
on tone_likes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists tone_uses (
  id uuid primary key default gen_random_uuid(),
  tone_id uuid not null references saved_tones(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table tone_uses enable row level security;
create policy "Members can view their tone uses"
on tone_uses for select
using (auth.uid() = user_id);
create policy "Members can create tone uses"
on tone_uses for insert
with check (auth.uid() = user_id);

create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tone_id uuid references saved_tones(id) on delete set null,
  post_type text not null default 'text' check (post_type in ('text', 'tone')),
  body text not null default '',
  visibility text not null default 'public' check (visibility in ('public', 'followers', 'private')),
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table feed_posts enable row level security;
create index if not exists feed_posts_timeline_idx on feed_posts(visibility, created_at desc);
create index if not exists feed_posts_user_idx on feed_posts(user_id, created_at desc);

create policy "Members can view feed posts"
on feed_posts for select
using (
  visibility = 'public'
  or auth.uid() = user_id
  or (
    visibility = 'followers'
    and exists (
      select 1 from follows
      where follows.follower_id = auth.uid()
        and follows.following_id = feed_posts.user_id
    )
  )
);

create policy "Members can manage their feed posts"
on feed_posts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references feed_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'audio')),
  url text not null,
  alt_text text,
  created_at timestamptz not null default now()
);

alter table post_media enable row level security;
create policy "Members can view post media"
on post_media for select
using (
  exists (
    select 1 from feed_posts
    where feed_posts.id = post_media.post_id
  )
);
create policy "Members can manage their post media"
on post_media for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists post_likes (
  post_id uuid not null references feed_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table post_likes enable row level security;
create policy "Members can view post likes"
on post_likes for select
using (auth.uid() is not null);
create policy "Members can manage their post likes"
on post_likes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references feed_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table post_comments enable row level security;
create index if not exists post_comments_post_idx on post_comments(post_id, created_at asc);
create policy "Members can view post comments"
on post_comments for select
using (
  exists (
    select 1 from feed_posts
    where feed_posts.id = post_comments.post_id
  )
);
create policy "Members can manage their post comments"
on post_comments for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('tone-images', 'tone-images', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'members-manage-tone-images'
  ) then
    create policy "members-manage-tone-images"
    on storage.objects
    for all
    using (bucket_id = 'tone-images' and auth.uid()::text = (storage.foldername(name))[1])
    with check (bucket_id = 'tone-images' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
end
$$;
