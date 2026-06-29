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

export interface SessionUser {
  id: string;
  email: string;
  role: "BRAND" | "CREATOR";
  name: string;
  phone?: string | null;
  isVerified: boolean;
  brandProfile?: {
    businessName: string;
    budgetMin: number;
    budgetMax: number;
    category: string;
    city: string;
    area: string;
  } | null;
  creatorProfile?: {
    instagramHandle: string;
    claimedCreatorId?: string | null;
  } | null;
}

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
  /** True when a brand/creator session cookie is active */
  isSignedUp: boolean;
  user: SessionUser | null;
  authLoading: boolean;
  refreshAuth: () => Promise<void>;
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
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [businessName, setBusinessName] = useState("your cloud kitchen");
  const [hydrated, setHydrated] = useState(false);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const nextUser = (data.user ?? null) as SessionUser | null;
        setUser(nextUser);
        if (nextUser?.brandProfile?.businessName) {
          setBusinessName(nextUser.brandProfile.businessName);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.filters) setFilters(mergeFilters(parsed.filters));
        if (parsed.shortlist) setShortlist(parsed.shortlist);
        if (parsed.businessName) setBusinessName(parsed.businessName);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ filters, shortlist, businessName })
    );
  }, [filters, shortlist, businessName, hydrated]);

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

  const isSignedUp = !!user;

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
        user,
        authLoading,
        refreshAuth,
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
