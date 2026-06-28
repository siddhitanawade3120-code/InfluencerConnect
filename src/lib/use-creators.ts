"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Creator } from "@/lib/types";

interface UseCreatorsOptions {
  activeOnly?: boolean;
  /** Background Instagram refresh for stale profiles (default true) */
  autoRefresh?: boolean;
}

async function fetchCreators(activeOnly: boolean): Promise<Creator[]> {
  const qs = activeOnly ? "" : "?activeOnly=false";
  const r = await fetch(`/api/creators${qs}`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error ?? "Failed to load creators");
  if (!Array.isArray(data)) throw new Error("Invalid response from server");
  return data as Creator[];
}

export function useCreators(options: UseCreatorsOptions = {}) {
  const { activeOnly = true, autoRefresh = true } = options;
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshStarted = useRef(false);

  const load = useCallback(async () => {
    const data = await fetchCreators(activeOnly);
    setCreators(data);
    setError(null);
    return data;
  }, [activeOnly]);

  useEffect(() => {
    let cancelled = false;

    fetchCreators(activeOnly)
      .then((data) => {
        if (!cancelled) {
          setCreators(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCreators([]);
          setError(err instanceof Error ? err.message : "Failed to load creators");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeOnly]);

  useEffect(() => {
    if (!autoRefresh || loading || refreshStarted.current) return;
    refreshStarted.current = true;

    let cancelled = false;

    (async () => {
      try {
        setRefreshing(true);
        const res = await fetch("/api/creators/refresh-stale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit: 3, activeOnly }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.refreshed > 0) {
          const updated = await fetchCreators(activeOnly);
          if (!cancelled) setCreators(updated);
        }
      } catch {
        // Silent — page still shows cached DB data
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeOnly, autoRefresh, loading]);

  return { creators, loading, refreshing, error, reload: load };
}
