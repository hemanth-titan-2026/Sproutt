-- ============================================================================
-- Sproutt — initial schema
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: everything is guarded with "if not exists" / "or replace".
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'pending',    -- cart / awaiting payment
      'paid',       -- payment captured  -> trees counted
      'fulfilled',  -- shipped           -> trees counted
      'cancelled',
      'refunded'
    );
  end if;
end $$;

-- Statuses that actually count towards a user's tree contribution.
create or replace function public.is_counted_status(s public.order_status)
returns boolean
language sql
immutable
as $$
  select s in ('paid', 'fulfilled');
$$;

-- ----------------------------------------------------------------------------
-- profiles — one row per auth user
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  full_name         text,
  avatar_url        text,
  -- Denormalised cache of trees from paid orders. Always recomputed by trigger,
  -- never incremented blindly, so it can't drift out of sync.
  trees_contributed integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- products — trees_per_unit is the "dynamic plant data" per product
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  description    text,
  image_url      text,
  price_cents    integer not null check (price_cents >= 0),
  currency       text not null default 'INR',
  -- How many trees ONE unit of this product funds. Change it per product and
  -- future orders pick up the new value automatically.
  trees_per_unit integer not null default 1 check (trees_per_unit >= 0),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- orders / order_items
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  status      public.order_status not null default 'pending',
  total_cents integer not null default 0,
  -- Sum of (quantity * trees_per_unit) across this order's items. Trigger-maintained.
  trees_total integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  paid_at     timestamptz
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx  on public.orders (status);

create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  product_id       uuid not null references public.products (id) on delete restrict,
  quantity         integer not null check (quantity > 0),
  -- Snapshots taken at purchase time so historical orders stay accurate even
  -- if the product's price or tree count changes later. Forced server-side by
  -- the snapshot trigger below — the client cannot fake these.
  unit_price_cents integer not null default 0,
  trees_per_unit   integer not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists order_items_order_id_idx   on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

-- ----------------------------------------------------------------------------
-- site_stats — single row of marketing/baseline numbers
-- ----------------------------------------------------------------------------
create table if not exists public.site_stats (
  id             boolean primary key default true check (id),
  -- Trees planted before/outside the platform (partner drives, offline events).
  -- The public counter shows baseline_trees + trees from paid orders.
  baseline_trees integer not null default 0,
  updated_at     timestamptz not null default now()
);

insert into public.site_stats (id, baseline_trees)
values (true, 12458)
on conflict (id) do nothing;

-- ============================================================================
-- Triggers
-- ============================================================================

-- updated_at housekeeping -----------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- New auth user -> profile row ------------------------------------------------
-- Reads Google's OAuth metadata (name / picture) as well as the full_name we
-- pass during email signup, so both providers land with a usable profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Snapshot price + trees from the product at insert time ----------------------
create or replace function public.snapshot_order_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.products%rowtype;
begin
  select * into p from public.products where id = new.product_id;
  if not found then
    raise exception 'Unknown product %', new.product_id;
  end if;

  new.unit_price_cents := p.price_cents;
  new.trees_per_unit   := p.trees_per_unit;
  return new;
end;
$$;

drop trigger if exists order_items_snapshot on public.order_items;
create trigger order_items_snapshot
  before insert on public.order_items
  for each row execute function public.snapshot_order_item();

-- Recalculate an order's totals from its items --------------------------------
create or replace function public.recalc_order_totals(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders o
  set total_cents = coalesce(t.total_cents, 0),
      trees_total = coalesce(t.trees_total, 0)
  from (
    select
      sum(quantity * unit_price_cents)::int as total_cents,
      sum(quantity * trees_per_unit)::int   as trees_total
    from public.order_items
    where order_id = p_order_id
  ) t
  where o.id = p_order_id;
end;
$$;

-- Recalculate a user's tree contribution from their counted orders ------------
create or replace function public.recalc_profile_trees(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p
  set trees_contributed = coalesce((
    select sum(o.trees_total)::int
    from public.orders o
    where o.user_id = p_user_id
      and public.is_counted_status(o.status)
  ), 0)
  where p.id = p_user_id;
end;
$$;

create or replace function public.order_items_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_user_id  uuid;
begin
  -- Branch on TG_OP rather than coalesce(new.x, old.x): NEW is not populated
  -- on DELETE, and reading a field off it there is not something to rely on.
  if tg_op = 'DELETE' then
    v_order_id := old.order_id;
  else
    v_order_id := new.order_id;
  end if;

  perform public.recalc_order_totals(v_order_id);

  select user_id into v_user_id from public.orders where id = v_order_id;
  if v_user_id is not null then
    perform public.recalc_profile_trees(v_user_id);
  end if;

  -- Return value is ignored for AFTER triggers, but must not be a field read.
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists order_items_recalc on public.order_items;
create trigger order_items_recalc
  after insert or update or delete on public.order_items
  for each row execute function public.order_items_changed();

-- Stamp paid_at the first time an order becomes counted. BEFORE UPDATE so we
-- mutate NEW in place rather than issuing a second UPDATE (which would re-enter
-- the AFTER trigger below).
create or replace function public.stamp_order_paid_at()
returns trigger
language plpgsql
as $$
begin
  if public.is_counted_status(new.status)
     and not public.is_counted_status(old.status)
     and new.paid_at is null then
    new.paid_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists orders_stamp_paid_at on public.orders;
create trigger orders_stamp_paid_at
  before update on public.orders
  for each row execute function public.stamp_order_paid_at();

create or replace function public.orders_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalc_profile_trees(old.user_id);
    return old;
  end if;

  perform public.recalc_profile_trees(new.user_id);
  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    perform public.recalc_profile_trees(old.user_id);
  end if;

  return new;
end;
$$;

drop trigger if exists orders_recalc on public.orders;
create trigger orders_recalc
  after insert or update or delete on public.orders
  for each row execute function public.orders_changed();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.site_stats  enable row level security;

-- profiles: you can read and edit only your own row.
drop policy if exists "profiles: read own"   on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;

create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- NOTE: there is deliberately no INSERT policy — profile rows are created by
-- the on_auth_user_created trigger.
--
-- RLS is row-level only, so the update policy above would otherwise let a user
-- write any column on their own row, including trees_contributed. Column-level
-- grants close that: a signed-in user may only edit their name and avatar.
-- trees_contributed stays writable solely by the security-definer recalc
-- functions, which run as the table owner.
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- products: readable by everyone, writable only by service role.
drop policy if exists "products: public read" on public.products;
create policy "products: public read"
  on public.products for select
  to anon, authenticated
  using (is_active);

-- orders: read your own, create your own as 'pending'. No client-side UPDATE
-- policy, so a user cannot flip their own order to 'paid' and mint trees.
drop policy if exists "orders: read own"   on public.orders;
drop policy if exists "orders: insert own" on public.orders;

create policy "orders: read own"
  on public.orders for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "orders: insert own"
  on public.orders for insert
  to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

-- order_items: scoped to your own orders, and only while still pending.
drop policy if exists "order_items: read own"   on public.order_items;
drop policy if exists "order_items: insert own" on public.order_items;
drop policy if exists "order_items: delete own" on public.order_items;

create policy "order_items: read own"
  on public.order_items for select
  to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = (select auth.uid())
  ));

create policy "order_items: insert own"
  on public.order_items for insert
  to authenticated
  with check (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = (select auth.uid())
      and o.status = 'pending'
  ));

create policy "order_items: delete own"
  on public.order_items for delete
  to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = (select auth.uid())
      and o.status = 'pending'
  ));

-- site_stats: nobody reads it directly; the RPC below is the public surface.

-- ============================================================================
-- Public RPCs
-- ============================================================================

-- Total trees funded across the whole community (baseline + paid orders).
-- security definer so anonymous visitors can see the headline number without
-- being able to read anyone's orders.
create or replace function public.global_trees_planted()
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select baseline_trees from public.site_stats where id), 0)
       + coalesce((
           select sum(trees_total)::int
           from public.orders
           where public.is_counted_status(status)
         ), 0);
$$;

grant execute on function public.global_trees_planted() to anon, authenticated;

-- Everything the profile widget needs in one round trip.
create or replace function public.my_impact()
returns table (
  trees_contributed integer,
  orders_count      integer,
  products_count    integer
)
language sql
security definer
stable
set search_path = public
as $$
  select
    coalesce((select p.trees_contributed from public.profiles p where p.id = auth.uid()), 0),
    coalesce((
      select count(*)::int from public.orders o
      where o.user_id = auth.uid() and public.is_counted_status(o.status)
    ), 0),
    coalesce((
      select sum(oi.quantity)::int
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where o.user_id = auth.uid() and public.is_counted_status(o.status)
    ), 0);
$$;

-- Postgres grants EXECUTE to PUBLIC by default, so the revoke is the part that
-- actually restricts this to signed-in users.
revoke execute on function public.my_impact() from public;
revoke execute on function public.my_impact() from anon;
grant  execute on function public.my_impact() to authenticated;

-- Internal plumbing: called only by triggers, which run as the table owner.
revoke execute on function public.recalc_order_totals(uuid)  from public, anon, authenticated;
revoke execute on function public.recalc_profile_trees(uuid) from public, anon, authenticated;

-- ============================================================================
-- Seed products (edit freely — trees_per_unit drives the contribution maths)
-- ============================================================================
insert into public.products (slug, name, description, price_cents, trees_per_unit, image_url)
values
  ('sproutt-tee',        'Sproutt Organic Tee',      'Organic cotton tee, dyed with plant-based pigments.',      129900, 5,  null),
  ('seed-kit',           'Grow-Your-Own Seed Kit',   'Six native saplings, compostable pots and a care guide.',   79900, 10, null),
  ('recycled-bottle',    'Recycled Steel Bottle',    'Made from 90% recycled steel. Keeps drinks cold 24h.',      99900, 3,  null),
  ('canvas-tote',        'Everyday Canvas Tote',     'Heavyweight organic canvas. Replaces ~500 plastic bags.',   49900, 2,  null),
  ('forest-fund',        'Plant a Forest (Gift)',    'Pure contribution — every rupee funds saplings.',          199900, 25, null)
on conflict (slug) do update
  set name           = excluded.name,
      description    = excluded.description,
      price_cents    = excluded.price_cents,
      trees_per_unit = excluded.trees_per_unit;
