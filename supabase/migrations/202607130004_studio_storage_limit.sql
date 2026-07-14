-- A 120-minute 24-bit / 48 kHz stereo WAV is roughly 2.1 GB.
-- The project-level global Storage limit must also be at least this high.
update storage.buckets
set file_size_limit = 4294967296
where id = 'studio-renders';
