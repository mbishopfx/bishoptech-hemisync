-- Add is_serenity column to saved_tones
alter table saved_tones add column if not exists is_serenity boolean not null default false;

-- Create index for faster querying
create index if not exists saved_tones_is_serenity_idx on saved_tones(is_serenity) where is_serenity = true;
