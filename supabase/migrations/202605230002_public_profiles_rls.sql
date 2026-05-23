-- Allow public profile viewing under visibility constraints
create policy "Anyone can view public profiles"
on profiles for select
using (profile_visibility = 'public' or auth.uid() = id);
