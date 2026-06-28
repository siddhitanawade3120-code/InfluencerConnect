"use client";

import { NICHES, FOLLOWER_TIERS, AREAS, CITIES, type SearchFilters as Filters, type Niche, type FollowerTier } from "@/lib/types";

interface SearchFiltersProps {
  filters: Filters;
  onChange: (partial: Partial<Filters>) => void;
  compact?: boolean;
}

export function SearchFilters({ filters, onChange, compact = false }: SearchFiltersProps) {
  const toggleNiche = (niche: Niche) => {
    const next = filters.niches.includes(niche)
      ? filters.niches.filter((n) => n !== niche)
      : [...filters.niches, niche];
    onChange({ niches: next });
  };

  const toggleTier = (tier: FollowerTier) => {
    const next = filters.followerTiers.includes(tier)
      ? filters.followerTiers.filter((t) => t !== tier)
      : [...filters.followerTiers, tier];
    onChange({ followerTiers: next.length ? next : [tier] });
  };

  return (
    <div className={`space-y-5 ${compact ? "text-sm" : ""}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-brown">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => onChange({ city: e.target.value, area: AREAS[e.target.value]?.[0] ?? "" })}
            className="w-full rounded-xl border border-cream-dark bg-white px-4 py-2.5 text-warm-brown focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-brown">
            Area
          </label>
          <select
            value={filters.area}
            onChange={(e) => onChange({ area: e.target.value })}
            className="w-full rounded-xl border border-cream-dark bg-white px-4 py-2.5 text-warm-brown focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          >
            {(AREAS[filters.city] ?? []).map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-warm-brown">
          Niche
        </label>
        <div className="flex flex-wrap gap-2">
          {NICHES.map((niche) => {
            const selected = filters.niches.includes(niche);
            return (
              <button
                key={niche}
                type="button"
                onClick={() => toggleNiche(niche)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-sage text-white"
                    : "bg-cream-dark text-warm-gray hover:bg-sage-light/40"
                }`}
              >
                {niche}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-warm-brown">
            Budget per post/reel
          </label>
          <span className="text-sm font-semibold text-terracotta">
            ₹{filters.budgetMin.toLocaleString("en-IN")} – ₹
            {filters.budgetMax >= 10000
              ? "10,000+"
              : filters.budgetMax.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={500}
            max={10000}
            step={100}
            value={filters.budgetMin}
            onChange={(e) =>
              onChange({
                budgetMin: Math.min(Number(e.target.value), filters.budgetMax - 100),
              })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-cream-dark accent-terracotta"
          />
          <input
            type="range"
            min={500}
            max={10000}
            step={100}
            value={filters.budgetMax}
            onChange={(e) =>
              onChange({
                budgetMax: Math.max(Number(e.target.value), filters.budgetMin + 100),
              })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-cream-dark accent-terracotta"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-warm-brown">
          Follower range
        </label>
        <div className="flex flex-wrap gap-2">
          {FOLLOWER_TIERS.map((tier) => {
            const selected = filters.followerTiers.includes(tier.id);
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => toggleTier(tier.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-terracotta text-white"
                    : "border border-cream-dark bg-white text-warm-gray hover:border-terracotta-light"
                }`}
              >
                <span className="block">{tier.label}</span>
                <span className={`text-xs ${selected ? "text-white/80" : "text-warm-gray"}`}>
                  {tier.range}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
