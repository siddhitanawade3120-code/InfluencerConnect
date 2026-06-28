"use client";

import { useRouter } from "next/navigation";
import { Search, Shield, MapPin, TrendingUp } from "lucide-react";
import { SearchFilters } from "@/components/SearchFilters";
import { useApp } from "@/lib/context";

const STATS = [
  { icon: Shield, label: "150+ verified creators", sub: "Real profiles, real engagement" },
  { icon: MapPin, label: "Vasai-Virar focused", sub: "Hyperlocal matching" },
  { icon: TrendingUp, label: "No bots, no fakes", sub: "Engagement quality checked" },
];

export default function HomePage() {
  const router = useRouter();
  const { filters, updateFilters } = useApp();

  const handleSearch = () => {
    router.push("/results");
  };

  return (
    <div className="min-h-[calc(100vh-57px)]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-terracotta-light/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-sage-light/30 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-sage-light/40 px-4 py-1 text-sm font-medium text-sage-dark">
            Starting in Vasai-Virar · Mumbai
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-warm-brown sm:text-5xl lg:text-6xl">
            Find Instagram Creators
            <br />
            <span className="text-terracotta">Who Fit Your Budget</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-warm-gray">
            Match your cloud kitchen or small restaurant with hyperlocal
            micro-influencers — no agency fees, no guesswork. See creators
            instantly, no signup required.
          </p>
        </div>

        {/* Search card */}
        <div className="relative mx-auto mt-10 max-w-2xl">
          <div className="rounded-3xl border border-cream-dark bg-white p-6 shadow-lg sm:p-8">
            <SearchFilters filters={filters} onChange={updateFilters} />
            <button
              type="button"
              onClick={handleSearch}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta py-4 text-lg font-bold text-white transition-colors hover:bg-terracotta-dark"
            >
              <Search className="h-5 w-5" />
              Find Creators
            </button>
            <p className="mt-3 text-center text-xs text-warm-gray">
              Preview results free · Sign up only to unlock contact & outreach
            </p>
          </div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="border-t border-cream-dark bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {STATS.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="rounded-2xl border border-cream-dark bg-cream p-6 text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta/10">
                <Icon className="h-6 w-6 text-terracotta" />
              </div>
              <h3 className="font-bold text-warm-brown">{label}</h3>
              <p className="mt-1 text-sm text-warm-gray">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-warm-brown">Built for small businesses</h2>
          <p className="mt-3 text-warm-gray">
            Cloud kitchens, bakeries, dessert shops, and boutique cafes — find
            creators who actually reach your local customers in Vasai, Virar,
            and Nalasopara.
          </p>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
            {[
              { step: "1", title: "Set your budget", desc: "₹500 to ₹10,000+ per post" },
              { step: "2", title: "Browse & shortlist", desc: "Filter by niche, followers, area" },
              { step: "3", title: "Reach out", desc: "Auto-drafted DMs, track responses" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="rounded-2xl bg-white p-5 shadow-sm">
                <span className="text-3xl font-bold text-terracotta-light">{step}</span>
                <h3 className="mt-2 font-semibold text-warm-brown">{title}</h3>
                <p className="mt-1 text-sm text-warm-gray">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
