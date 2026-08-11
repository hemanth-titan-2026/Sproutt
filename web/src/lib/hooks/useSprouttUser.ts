"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

export type SprouttImpact = {
  trees_contributed: number;
  orders_count: number;
  products_count: number;
};

export type SprouttProfile = {
  full_name: string | null;
  avatar_url: string | null;
  trees_contributed: number;
};

const EMPTY_IMPACT: SprouttImpact = {
  trees_contributed: 0,
  orders_count: 0,
  products_count: 0,
};

/**
 * Client-side view of "who is signed in and how many trees have they funded".
 *
 * Used by the nav widget, which lives inside the landing page's Client
 * Component tree and so can't read the session on the server.
 */
export function useSprouttUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SprouttProfile | null>(null);
  const [impact, setImpact] = useState<SprouttImpact>(EMPTY_IMPACT);
  const [loading, setLoading] = useState(true);

  const loadDetails = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      setImpact(EMPTY_IMPACT);
      return;
    }

    const supabase = createClient();

    const [{ data: profileRow }, { data: impactRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, avatar_url, trees_contributed")
        .eq("id", currentUser.id)
        .maybeSingle(),
      supabase.rpc("my_impact"),
    ]);

    setProfile((profileRow as SprouttProfile) ?? null);

    const row = Array.isArray(impactRows) ? impactRows[0] : impactRows;
    setImpact((row as SprouttImpact) ?? EMPTY_IMPACT);
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      loadDetails(data.user).finally(() => {
        if (active) setLoading(false);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      // Deferred: calling other Supabase methods synchronously inside this
      // callback can deadlock the client's internal auth lock.
      setTimeout(() => {
        if (active) loadDetails(nextUser);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadDetails]);

  const displayName =
    profile?.full_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    null;

  const avatarUrl =
    profile?.avatar_url ??
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined) ??
    null;

  return {
    user,
    profile,
    impact,
    loading,
    displayName,
    avatarUrl,
    // profiles.trees_contributed is the trigger-maintained cache; my_impact()
    // recomputes it. They agree, but prefer the RPC as the source of truth.
    trees: impact.trees_contributed || profile?.trees_contributed || 0,
    refresh: () => loadDetails(user),
  };
}

/**
 * Community-wide tree total for the public counter in the nav.
 * Falls back to 0, never a made-up figure — the number is a public claim.
 */
export function useGlobalTrees(fallback = 0) {
  const [trees, setTrees] = useState(fallback);

  useEffect(() => {
    let active = true;
    createClient()
      .rpc("global_trees_planted")
      .then(({ data, error }) => {
        if (!active || error || typeof data !== "number") return;
        setTrees(data);
      });
    return () => {
      active = false;
    };
  }, []);

  return trees;
}
