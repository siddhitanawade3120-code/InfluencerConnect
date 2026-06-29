"use client";

import {
  NICHES,
  FOLLOWER_TIERS,
  AREAS,
  CITIES,
  formatFollowers,
  type SearchFilters as Filters,
  type Niche,
} from "@/lib/types";

interface SearchFiltersProps {
  filters: Filters;
  onChange: (partial: Partial<Filters>) => void;
  compact?: boolean;
}

const FOLLOWER_PRESETS = [
  { label: "Under 100", min: 0, max: 99 },
  { label: "100 – 1K", min: 100, max: 999 },
  { label: "1K – 10K", min: 1000, max: 9999 },
  { label: "10K – 50K", min: 10000, max: 49999 },
  { label: "50K+", min: 50000, max: 500_000 },
] as const;

export function SearchFilters({ filters, onChange, compact = false }: SearchFiltersProps) {
  const toggleNiche = (niche: Niche) => {
    const next = filters.niches.includes(niche)
      ? filters.niches.filter((n) => n !== niche)
      : [...filters.niches, niche];
    onChange({ niches: next });
  };

  const setFollowerRange = (min: number, max: number) => {
    onChange({ followerMin: min, followerMax: max, followerTiers: [] });
  };

  const parseFollowerInput = (value: string, fallback: number): number => {
    const n = parseInt(value.replace(/,/g, ""), 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const inputClass =
    "w-full rounded-xl border border-cream-dark bg-white px-4 py-2.5 text-warm-brown focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20";

  return (
    <div className={`space-y-5 ${compact ? "text-sm" : ""}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-brown">City</label>
          <select
            value={filters.city}
            onChange={(e) =>
              onChange({ city: e.target.value, area: AREAS[e.target.value]?.[0] ?? "" })
            }
            className={inputClass}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-brown">Area</label>
          <select
            value={filters.area}
            onChange={(e) => onChange({ area: e.target.value })}
            className={inputClass}
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
        <label className="mb-2 block text-sm font-medium text-warm-brown">Niche</label>
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
          <label className="text-sm font-medium text-warm-brown">Budget per post/reel</label>
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
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-warm-brown">Followers</label>
          <span className="text-sm font-semibold text-terracotta">
            {formatFollowers(filters.followerMin)} – {formatFollowers(filters.followerMax)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-warm-gray">Min followers</label>
            <input
              type="number"
              min={0}
              max={10_000_000}
              step={1}
              value={filters.followerMin}
              onChange={(e) => {
                const min = parseFollowerInput(e.target.value, 0);
                onChange({
                  followerMin: min,
                  followerMax: Math.max(min, filters.followerMax),
                  followerTiers: [],
                });
              }}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-warm-gray">Max followers</label>
            <input
              type="number"
              min={0}
              max={10_000_000}
              step={1}
              value={filters.followerMax}
              onChange={(e) => {
                const max = parseFollowerInput(e.target.value, filters.followerMax);
                onChange({
                  followerMax: max,
                  followerMin: Math.min(filters.followerMin, max),
                  followerTiers: [],
                });
              }}
              placeholder="500000"
              className={inputClass}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-warm-gray">
          e.g. min 0 and max 99 to find creators under 100 followers
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FOLLOWER_PRESETS.map(({ label, min, max }) => {
            const active = filters.followerMin === min && filters.followerMax === max;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setFollowerRange(min, max)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-terracotta text-white"
                    : "border border-cream-dark bg-white text-warm-gray hover:border-terracotta-light"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {/* Legacy tier labels for reference in compact mode */}
        {!compact && (
          <p className="mt-2 text-[10px] text-warm-gray/80">
            Nano {FOLLOWER_TIERS[0].range} · Micro {FOLLOWER_TIERS[1].range} · Mid{" "}
            {FOLLOWER_TIERS[2].range}+
          </p>
        )}
      </div>
    </div>
  );
}
