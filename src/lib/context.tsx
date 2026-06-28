"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  SearchFilters,
  ShortlistItem,
  OutreachStatus,
} from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/types";

interface AppContextValue {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  updateFilters: (partial: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  shortlist: ShortlistItem[];
  addToShortlist: (creatorId: string) => void;
  removeFromShortlist: (creatorId: string) => void;
  isInShortlist: (creatorId: string) => boolean;
  updateShortlistStatus: (creatorId: string, status: OutreachStatus) => void;
  isSignedUp: boolean;
  setSignedUp: (value: boolean) => void;
  businessName: string;
  setBusinessName: (name: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "influconnect_state";

function mergeFilters(stored: Partial<SearchFilters> | undefined): SearchFilters {
  if (!stored) return DEFAULT_FILTERS;
  return {
    ...DEFAULT_FILTERS,
    ...stored,
    niches: stored.niches ?? DEFAULT_FILTERS.niches,
    followerTiers: stored.followerTiers?.length
      ? stored.followerTiers
      : DEFAULT_FILTERS.followerTiers,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [isSignedUp, setSignedUp] = useState(false);
  const [businessName, setBusinessName] = useState("your cloud kitchen");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.filters) setFilters(mergeFilters(parsed.filters));
        if (parsed.shortlist) setShortlist(parsed.shortlist);
        if (parsed.isSignedUp) setSignedUp(parsed.isSignedUp);
        if (parsed.businessName) setBusinessName(parsed.businessName);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ filters, shortlist, isSignedUp, businessName })
    );
  }, [filters, shortlist, isSignedUp, businessName, hydrated]);

  const updateFilters = useCallback((partial: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const addToShortlist = useCallback((creatorId: string) => {
    setShortlist((prev) => {
      if (prev.some((s) => s.creatorId === creatorId)) return prev;
      return [
        ...prev,
        { creatorId, status: "not_sent" as OutreachStatus, addedAt: Date.now() },
      ];
    });
  }, []);

  const removeFromShortlist = useCallback((creatorId: string) => {
    setShortlist((prev) => prev.filter((s) => s.creatorId !== creatorId));
  }, []);

  const isInShortlist = useCallback(
    (creatorId: string) => shortlist.some((s) => s.creatorId === creatorId),
    [shortlist]
  );

  const updateShortlistStatus = useCallback(
    (creatorId: string, status: OutreachStatus) => {
      setShortlist((prev) =>
        prev.map((s) => (s.creatorId === creatorId ? { ...s, status } : s))
      );
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        filters,
        setFilters,
        updateFilters,
        resetFilters,
        shortlist,
        addToShortlist,
        removeFromShortlist,
        isInShortlist,
        updateShortlistStatus,
        isSignedUp,
        setSignedUp,
        businessName,
        setBusinessName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
