"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, ArrowLeft, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { SearchFilters } from "@/components/SearchFilters";
import { CreatorCard } from "@/components/CreatorCard";
import { useApp } from "@/lib/context";
import { useCreators } from "@/lib/use-creators";
import { sortCreators, type SortOption } from "@/lib/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "match", label: "Best match" },
  { value: "engagement", label: "Engagement rate" },
  { value: "followers", label: "Followers" },
  { value: "price_low", label: "Price: low to high" },
];

export default function ResultsPage() {
  const { filters, updateFilters, resetFilters, shortlist, user, authLoading } = useApp();
  const hasBrandBudget = user?.role === "BRAND" && !!user.brandProfile;
  const [sort, setSort] = useState<SortOption>("followers");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { creators, loading, refreshing, error: fetchError } = useCreators({ filters });

  useEffect(() => {
    if (!authLoading && hasBrandBudget) {
      setSort("match");
    }
  }, [authLoading, hasBrandBudget]);

  const sortOptions = useMemo(
    () =>
      hasBrandBudget
        ? SORT_OPTIONS
        : SORT_OPTIONS.filter((o) => o.value !== "match"),
    [hasBrandBudget]
  );

  const results = useMemo(
    () => sortCreators(creators, sort),
    [creators, sort]
  );

  const showSignupBanner = !authLoading && !user;

  return (
    <div className="page-gradient min-h-[calc(100vh-57px)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {showSignupBanner && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-terracotta/20 bg-gradient-to-r from-terracotta/10 to-sage-light/20 px-5 py-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
              <div>
                <p className="font-semibold text-warm-brown">
                  Sign up free to send deal requests
                </p>
                <p className="text-sm text-warm-gray">
                  Only creators who registered on InfluConnect — sign up to send deals.
                </p>
              </div>
            </div>
            <Link href="/signup/brand" className="btn-primary shrink-0 !py-2 !text-sm">
              Create brand account
            </Link>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-2 inline-flex items-center gap-1 text-sm text-warm-gray hover:text-terracotta"
            >
              <ArrowLeft className="h-4 w-4" /> Back to search
            </Link>
            <h1 className="text-2xl font-bold text-warm-brown">
              {loading
                ? "Loading creators…"
                : fetchError
                  ? "Could not load creators"
                  : `${results.length} registered creator${results.length !== 1 ? "s" : ""}`}
            </h1>
            <p className="text-sm text-warm-gray">
              On InfluConnect · {filters.area}, {filters.city}
              {filters.niches.length > 0 && ` · ${filters.niches.join(", ")}`}
              {filters.budgetMin > 500 || filters.budgetMax < 10000
                ? ` · ₹${filters.budgetMin.toLocaleString("en-IN")}–₹${filters.budgetMax.toLocaleString("en-IN")}`
                : ""}
              {refreshing && (
                <span className="ml-2 text-sage-dark"> · Updating stats from Instagram…</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-xl border border-cream-dark bg-white px-4 py-2 text-sm font-medium focus:border-terracotta focus:outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>

            {shortlist.length > 0 && (
              <Link
                href="/shortlist"
                className="rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark"
              >
                Shortlist ({shortlist.length})
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 rounded-xl border border-cream-dark bg-white px-4 py-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Database connection failed</p>
              <p className="mt-1">{fetchError}</p>
              <p className="mt-2 text-red-700">
                Fix in MongoDB Atlas: (1) Resume cluster if paused, (2) Network Access →
                Add IP → Allow from anywhere for dev, (3) restart{" "}
                <code className="rounded bg-red-100 px-1">npm run dev</code>
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          <aside
            className={`${
              mobileFiltersOpen ? "block" : "hidden"
            } w-full shrink-0 lg:block lg:w-72`}
          >
            <div className="card sticky top-[73px] !p-5">
              <h2 className="mb-4 font-semibold text-warm-brown">Refine search</h2>
              <SearchFilters filters={filters} onChange={updateFilters} compact />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-warm-gray">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
              </div>
            ) : fetchError ? null : results.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-lg font-medium text-warm-brown">
                  No registered creators match your filters yet
                </p>
                <p className="mt-2 text-sm text-warm-gray">
                  Try widening your budget or area — or ask creators in your network to join
                  InfluConnect.
                </p>
                <button type="button" onClick={resetFilters} className="btn-primary mt-4 !text-sm">
                  Reset filters
                </button>
                <Link href="/" className="mt-4 block text-terracotta hover:underline">
                  Adjust search on home page
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} showMatchScore={hasBrandBudget} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
