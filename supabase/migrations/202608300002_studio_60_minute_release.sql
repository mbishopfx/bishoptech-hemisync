-- The member Workshop is a one-hour product. Keep the private MP3 bucket
-- large enough for a 60-minute 192 kbps stereo export.

update storage.buckets
set file_size_limit = 268435456,
    allowed_mime_types = array['audio/mpeg']::text[]
where id = 'studio-renders';
