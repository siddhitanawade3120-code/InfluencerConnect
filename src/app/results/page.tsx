"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, ArrowLeft, AlertCircle, Sparkles, Share2 } from "lucide-react";
import { SearchFilters } from "@/components/SearchFilters";
import { CreatorCard } from "@/components/CreatorCard";
import { CreatorGridSkeleton } from "@/components/CreatorCardSkeleton";
import { MarketplaceStats } from "@/components/MarketplaceStats";
import { useApp } from "@/lib/context";
import { useCreators } from "@/lib/use-creators";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { sortCreators, type SortOption } from "@/lib/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "match", label: "Best match" },
  { value: "engagement", label: "Engagement rate" },
  { value: "followers", label: "Followers" },
  { value: "price_low", label: "Price: low to high" },
];

export default function ResultsPage() {
  const { filters, updateFilters, resetFilters, shortlist, user, authLoading } = useApp();
  const debouncedFilters = useDebouncedValue(filters, 350);
  const hasBrandBudget = user?.role === "BRAND" && !!user.brandProfile;
  const [sort, setSort] = useState<SortOption>("followers");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { creators, loading, error: fetchError } = useCreators({ filters: debouncedFilters });
  const [copied, setCopied] = useState(false);

  const filtersPending =
    JSON.stringify(filters) !== JSON.stringify(debouncedFilters);

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

  const results = useMemo(() => sortCreators(creators, sort), [creators, sort]);

  const showSignupBanner = !authLoading && !user;
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup/creator`
      : "/signup/creator";

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(
        `Join InfluConnect — get collab offers from local businesses in Vasai-Virar: ${inviteUrl}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="page-gradient min-h-[calc(100vh-57px)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <MarketplaceStats compact />
        </div>

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
              {loading || filtersPending
                ? "Finding creators…"
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
              <p className="font-semibold">Could not load creators</p>
              <p className="mt-1">{fetchError}</p>
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
            {loading || filtersPending ? (
              <CreatorGridSkeleton count={6} />
            ) : fetchError ? null : results.length === 0 ? (
              <div className="card space-y-4 p-12 text-center">
                <p className="text-lg font-medium text-warm-brown">
                  No registered creators match your filters yet
                </p>
                <p className="text-sm text-warm-gray">
                  Widen your budget or area — or invite creators to join InfluConnect.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={resetFilters} className="btn-primary !text-sm">
                    Reset filters
                  </button>
                  <button type="button" onClick={copyInvite} className="btn-secondary !text-sm">
                    <Share2 className="h-4 w-4" />
                    {copied ? "Link copied!" : "Copy creator invite link"}
                  </button>
                </div>
                <Link href="/signup/creator" className="block text-sm text-terracotta hover:underline">
                  Or join as a creator yourself →
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
