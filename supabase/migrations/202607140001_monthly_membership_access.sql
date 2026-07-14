-- Paid-only platform access. Existing lifetime members remain permanently entitled.
begin;

alter table public.profiles
  add column if not exists entitlement_type text not null default 'none',
  add column if not exists billing_status text not null default 'inactive',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists payment_method_attached boolean not null default false,
  add column if not exists grandfathered_at timestamptz;

alter table public.profiles
  alter column subscription_tier set default 'none';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_entitlement_type_check'
  ) then
    alter table public.profiles
      add constraint profiles_entitlement_type_check
      check (entitlement_type in ('none', 'monthly', 'lifetime'));
  end if;
end
$$;

-- The two established lifetime profiles are the only grandfathered accounts.
update public.profiles
set entitlement_type = 'lifetime',
    billing_status = 'active',
    payment_method_attached = false,
    grandfathered_at = coalesce(grandfathered_at, now()),
    plan = 'founder'
where subscription_tier = 'lifetime';

-- Historical free or stale premium labels do not grant paid platform access.
update public.profiles
set entitlement_type = 'none',
    billing_status = 'inactive',
    stripe_customer_id = null,
    stripe_subscription_id = null,
    payment_method_attached = false
where subscription_tier <> 'lifetime'
  and entitlement_type <> 'lifetime';

create unique index if not exists profiles_stripe_customer_unique
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists profiles_stripe_subscription_unique
  on public.profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;

commit;
