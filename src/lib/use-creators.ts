"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Creator, SearchFilters } from "@/lib/types";
import { filtersToSearchParams } from "@/lib/creator-query";

interface UseCreatorsOptions {
  filters?: SearchFilters;
  activeOnly?: boolean;
  /** Background Instagram refresh — off by default (slow). Enable only when needed. */
  autoRefresh?: boolean;
}

const clientCache = new Map<string, { data: Creator[]; at: number }>();
const CLIENT_CACHE_MS = 20_000;

function buildCreatorsUrl(filters: SearchFilters | undefined, activeOnly: boolean): string {
  if (filters) {
    const params = filtersToSearchParams(filters, activeOnly);
    return `/api/creators?${params.toString()}`;
  }
  return activeOnly ? "/api/creators" : "/api/creators?activeOnly=false";
}

async function fetchCreators(
  filters: SearchFilters | undefined,
  activeOnly: boolean
): Promise<Creator[]> {
  const url = buildCreatorsUrl(filters, activeOnly);
  const cached = clientCache.get(url);
  if (cached && Date.now() - cached.at < CLIENT_CACHE_MS) {
    return cached.data;
  }

  const r = await fetch(url);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error ?? "Failed to load creators");
  if (!Array.isArray(data)) throw new Error("Invalid response from server");

  const creators = data as Creator[];
  clientCache.set(url, { data: creators, at: Date.now() });
  return creators;
}

export function invalidateCreatorsClientCache(): void {
  clientCache.clear();
}

export function useCreators(options: UseCreatorsOptions = {}) {
  const { filters, activeOnly = true, autoRefresh = false } = options;
  const filterKey = filters ? filtersToSearchParams(filters, activeOnly).toString() : "";
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshStarted = useRef(false);

  const load = useCallback(async () => {
    const data = await fetchCreators(filters, activeOnly);
    setCreators(data);
    setError(null);
    return data;
  }, [filters, activeOnly]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchCreators(filters, activeOnly)
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
  }, [filters, activeOnly, filterKey]);

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
          body: JSON.stringify({ limit: 2, activeOnly }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.refreshed > 0) {
          invalidateCreatorsClientCache();
          const updated = await fetchCreators(filters, activeOnly);
          if (!cancelled) setCreators(updated);
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeOnly, autoRefresh, loading, filters, filterKey]);

  return { creators, loading, refreshing, error, reload: load };
}
