-- Free-tier release profile: 20-minute maximum, genuine 192 kbps MP3 only.
alter table public.renders
  alter column export_formats set default array['mp3']::text[];

update public.session_specs
set spec = jsonb_set(spec, '{exportFormats}', '["mp3"]'::jsonb, true)
where spec->>'kind' = 'studio';

update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array['audio/mpeg']::text[]
where id = 'studio-renders';
