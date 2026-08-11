-- ============================================================================
-- Sproutt — the notebook, and retiring the demo seeds
--
-- Run in the Supabase SQL editor. Safe to re-run.
-- ============================================================================

-- The real product. ₹150 = 15000 paise; price_cents is the minor unit.
-- trees_per_unit = 1 → one notebook funds one tree.
insert into public.products (slug, name, description, price_cents, currency, trees_per_unit, is_active)
values (
  'sproutt-notebook',
  'Sproutt Notebook',
  'A6 hardcover notebook, 160 pages of 100% recycled paper, bound in Sproutt green. Every notebook funds one tree.',
  15000,
  'INR',
  1,
  true
)
on conflict (slug) do update
  set name           = excluded.name,
      description    = excluded.description,
      price_cents    = excluded.price_cents,
      currency       = excluded.currency,
      trees_per_unit = excluded.trees_per_unit,
      is_active      = true;

-- The five products in 0001 were placeholders for testing the tree maths, not
-- real inventory. Hide them so the shop shows only what you actually sell.
-- They're deactivated rather than deleted: any test orders that reference them
-- keep working, and the tree counts on those orders stay intact.
--
-- To bring one back:  update public.products set is_active = true where slug = '...';
update public.products
set is_active = false
where slug in ('sproutt-tee', 'seed-kit', 'recycled-bottle', 'canvas-tote', 'forest-fund');

-- Let a user discard their own abandoned cart. Scoped to 'pending' only, so a
-- paid order — and the tree contribution attached to it — can never be deleted
-- from the client to rewrite history.
drop policy if exists "orders: delete own pending" on public.orders;
create policy "orders: delete own pending"
  on public.orders for delete
  to authenticated
  using (user_id = (select auth.uid()) and status = 'pending');
