-- Premium Cognistration Studio: private projects, renders, and delivery state.

alter table public.renders
  add column if not exists phase text not null default 'queued',
  add column if not exists progress integer not null default 0,
  add column if not exists validation jsonb not null default '{}'::jsonb,
  add column if not exists export_formats text[] not null default array['wav','mp3']::text[],
  add column if not exists delivery_email_sent_at timestamptz,
  add column if not exists delivery_email_error text;

alter table public.renders
  drop constraint if exists renders_phase_check;

alter table public.renders
  add constraint renders_phase_check
  check (phase in ('queued', 'rendering', 'uploading', 'validating', 'completed', 'failed'));

alter table public.renders
  drop constraint if exists renders_progress_check;

alter table public.renders
  add constraint renders_progress_check
  check (progress between 0 and 100);

create index if not exists renders_user_created_idx
  on public.renders(user_id, created_at desc);

create index if not exists session_specs_user_updated_idx
  on public.session_specs(user_id, updated_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-renders',
  'studio-renders',
  false,
  1073741824,
  array['audio/wav', 'audio/mpeg']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "studio users read own render files" on storage.objects;
create policy "studio users read own render files"
on storage.objects for select
using (
  bucket_id = 'studio-renders'
  and auth.uid()::text = (storage.foldername(name))[1]
);
