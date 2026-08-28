-- Anonymous, service-role-only feedback submitted from the in-platform agent widget.
begin;

create table if not exists public.agent_feedback (
  id uuid primary key default gen_random_uuid(),
  rating text not null check (rating in ('positive', 'negative')),
  comment text,
  surface text not null default 'mcp_widget' check (surface in ('mcp_widget', 'webmcp')),
  source text not null default 'cognistration_agent' check (source in ('cognistration_agent', 'internal')),
  created_at timestamptz not null default now()
);

create index if not exists agent_feedback_created_idx
  on public.agent_feedback(created_at desc);

alter table public.agent_feedback enable row level security;

-- No public or authenticated policies are defined. The server inserts a
-- bounded, sanitized record with the Supabase service role; no public read
-- route or MCP tool exposes feedback history.

commit;
