-- Make UCP checkout completion and cancellation retries durable.
-- UCP defines complete_in_progress as a first-class checkout state.
begin;

alter table public.commerce_checkouts
  add column if not exists cancel_idempotency_key text;

alter table public.commerce_checkouts
  drop constraint if exists commerce_checkouts_status_check;

alter table public.commerce_checkouts
  add constraint commerce_checkouts_status_check
  check (status in ('incomplete', 'ready_for_complete', 'complete_in_progress', 'requires_escalation', 'completed', 'canceled', 'expired'));

create index if not exists commerce_checkouts_completion_key_idx
  on public.commerce_checkouts(completion_idempotency_key)
  where completion_idempotency_key is not null;

create index if not exists commerce_checkouts_cancel_key_idx
  on public.commerce_checkouts(cancel_idempotency_key)
  where cancel_idempotency_key is not null;

commit;
