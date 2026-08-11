-- ============================================================================
-- Sproutt — tighten function execute grants
--
-- Postgres grants EXECUTE on new functions to PUBLIC by default, so the
-- `grant execute ... to authenticated` in 0001 added nothing and my_impact()
-- was reachable by anonymous visitors. It returned zeros rather than leaking
-- anything (every subquery filters on auth.uid(), which is null for anon), but
-- an unauthenticated caller should not be able to invoke it at all.
--
-- Safe to re-run.
-- ============================================================================

-- my_impact(): signed-in users only.
revoke execute on function public.my_impact() from public;
revoke execute on function public.my_impact() from anon;
grant  execute on function public.my_impact() to authenticated;

-- global_trees_planted(): intentionally public — it's the headline counter that
-- anonymous visitors see on the landing page. Stated explicitly so the grant is
-- a decision rather than a Postgres default.
grant execute on function public.global_trees_planted() to anon, authenticated;

-- The recalc helpers are internal plumbing, called only from triggers (which
-- run as the table owner). No client role should be able to call them directly
-- and force a recalculation.
revoke execute on function public.recalc_order_totals(uuid)  from public, anon, authenticated;
revoke execute on function public.recalc_profile_trees(uuid) from public, anon, authenticated;
