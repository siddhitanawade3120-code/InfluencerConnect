"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Shield,
  MapPin,
  TrendingUp,
  Building2,
  Camera,
  ArrowRight,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { SearchFilters } from "@/components/SearchFilters";
import { MarketplaceStats } from "@/components/MarketplaceStats";
import { useApp } from "@/lib/context";

const STATS = [
  {
    icon: UserCheck,
    label: "Registered creators only",
    sub: "Every profile belongs to a creator who joined InfluConnect",
  },
  {
    icon: MapPin,
    label: "Vasai-Virar focused",
    sub: "Hyperlocal creators who reach your customers",
  },
  {
    icon: TrendingUp,
    label: "Built for small business",
    sub: "Filter by budget, niche & followers — no agency fees",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { filters, updateFilters, user } = useApp();
  const isBrand = user?.role === "BRAND";

  const handleSearch = () => {
    router.push("/results");
  };

  return (
    <div className="page-gradient">
      <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-terracotta-light/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-sage-light/25 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-sage-light/50 bg-white/80 px-4 py-1.5 text-sm font-medium text-sage-dark shadow-sm backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5" />
            Vasai-Virar · Small business × local creators
          </span>

          <h1 className="animate-fade-up-delay-1 mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-warm-brown sm:text-5xl lg:text-6xl">
            Find creators who
            <br />
            <span className="bg-gradient-to-r from-terracotta to-terracotta-dark bg-clip-text text-transparent">
              registered with us
            </span>
          </h1>

          <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-warm-gray">
            Creators join InfluConnect with their Instagram. Your cloud kitchen, cafe, or
            restaurant signs up, filters the list, and sends deal requests — only to
            creators on our platform.
          </p>

          {!user && (
            <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup/brand" className="btn-primary">
                <Building2 className="h-4 w-4" />
                Sign up as a business
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/signup/creator" className="btn-secondary">
                <Camera className="h-4 w-4" />
                I&apos;m a creator
              </Link>
            </div>
          )}

          {isBrand && (
            <Link href="/results" className="animate-fade-up-delay-2 btn-primary mt-8">
              Browse registered creators
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="relative mx-auto mt-12 max-w-2xl">
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl shadow-terracotta/5 backdrop-blur-sm sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="text-left">
                <h2 className="text-lg font-semibold text-warm-brown">
                  Filter registered creators
                </h2>
                <p className="mt-1 text-xs text-warm-gray">
                  Budget · area · niche · followers
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-sage-light/40 px-3 py-1 text-xs font-semibold text-sage-dark">
                Live directory
              </span>
            </div>
            <SearchFilters filters={filters} onChange={updateFilters} />
            <button
              type="button"
              onClick={handleSearch}
              className="btn-primary mt-6 w-full !rounded-2xl !py-4 !text-lg"
            >
              <Search className="h-5 w-5" />
              Search creators
            </button>
            <p className="mt-3 text-center text-xs text-warm-gray">
              Preview free · Business signup required to send deal requests
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-cream-dark bg-white/80 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-wide text-warm-gray">
            Live marketplace
          </p>
          <MarketplaceStats />
        </div>
      </section>

      <section className="border-y border-cream-dark bg-white/70 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {STATS.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="card card-hover text-center !p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta/10 to-sage-light/30">
                <Icon className="h-7 w-7 text-terracotta" />
              </div>
              <h3 className="text-lg font-bold text-warm-brown">{label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-warm-gray">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two-sided marketplace */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-warm-brown">How InfluConnect works</h2>
            <p className="mt-3 text-warm-gray">
              A two-sided marketplace — not a random Instagram database
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="card !border-sage/30 !p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-light/40">
                <Camera className="h-6 w-6 text-sage-dark" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-warm-brown">Creators register</h3>
              <ol className="mt-4 space-y-3 text-sm text-warm-gray">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light/50 text-xs font-bold text-sage-dark">
                    1
                  </span>
                  Sign up with Instagram handle — we import stats automatically
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light/50 text-xs font-bold text-sage-dark">
                    2
                  </span>
                  Profile goes live in the directory for local brands
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light/50 text-xs font-bold text-sage-dark">
                    3
                  </span>
                  Receive deal requests in your private dashboard
                </li>
              </ol>
              <Link href="/signup/creator" className="btn-secondary mt-6 !text-sm">
                Join as creator
              </Link>
            </div>

            <div className="card !border-terracotta/25 !p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10">
                <Building2 className="h-6 w-6 text-terracotta" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-warm-brown">Businesses filter &amp; hire</h3>
              <ol className="mt-4 space-y-3 text-sm text-warm-gray">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-xs font-bold text-terracotta">
                    1
                  </span>
                  Sign up as a brand — set your budget and location
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-xs font-bold text-terracotta">
                    2
                  </span>
                  Filter creators registered on InfluConnect by budget &amp; niche
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-xs font-bold text-terracotta">
                    3
                  </span>
                  Shortlist, send deal requests, negotiate in one place
                </li>
              </ol>
              <Link href="/signup/brand" className="btn-primary mt-6 !text-sm">
                Sign up as a business
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-cream-dark bg-gradient-to-br from-terracotta/5 via-cream to-sage-light/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Shield className="mx-auto h-10 w-10 text-terracotta" />
          <h2 className="mt-4 text-2xl font-bold text-warm-brown">
            Why not a giant creator database?
          </h2>
          <p className="mt-4 text-warm-gray leading-relaxed">
            Unlike tools that scrape millions of random profiles, InfluConnect only lists
            creators who signed up and agreed to work with local businesses. You filter
            real, reachable people — and deals happen on-platform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup/brand" className="btn-primary !text-sm">
              <Sparkles className="h-4 w-4" />
              Start as a business
            </Link>
            <Link href="/results" className="btn-secondary !text-sm">
              Preview creator directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
