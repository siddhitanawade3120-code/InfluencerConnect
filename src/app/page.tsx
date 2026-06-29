"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Shield,
  MapPin,
  TrendingUp,
  Handshake,
  Building2,
  Camera,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SearchFilters } from "@/components/SearchFilters";
import { useApp } from "@/lib/context";

const STATS = [
  { icon: Shield, label: "Verified creators", sub: "Real profiles, real engagement data" },
  { icon: MapPin, label: "Vasai-Virar focused", sub: "Hyperlocal creators near your customers" },
  { icon: TrendingUp, label: "Budget-friendly", sub: "From ₹500 — no agency fees" },
];

const STEPS = [
  {
    step: "1",
    title: "Set your budget",
    desc: "Tell us your range per post or reel",
    icon: Sparkles,
  },
  {
    step: "2",
    title: "Browse & shortlist",
    desc: "Filter by niche, followers, and area",
    icon: Search,
  },
  {
    step: "3",
    title: "Send deal requests",
    desc: "Negotiate and track everything in one place",
    icon: Handshake,
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
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-terracotta-light/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-sage-light/25 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-sage-light/50 bg-white/80 px-4 py-1.5 text-sm font-medium text-sage-dark shadow-sm backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5" />
            Vasai-Virar · Mumbai
          </span>

          <h1 className="animate-fade-up-delay-1 mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-warm-brown sm:text-5xl lg:text-6xl">
            Connect your business with
            <br />
            <span className="bg-gradient-to-r from-terracotta to-terracotta-dark bg-clip-text text-transparent">
              local Instagram creators
            </span>
          </h1>

          <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-warm-gray">
            Cloud kitchens, cafes, and small restaurants — find micro-influencers who
            actually reach your neighbourhood. Search free, sign up to send deals.
          </p>

          {!user && (
            <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup/brand" className="btn-primary">
                <Building2 className="h-4 w-4" />
                I&apos;m a business
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/signup/creator" className="btn-secondary">
                <Camera className="h-4 w-4" />
                I&apos;m a creator
              </Link>
            </div>
          )}

          {isBrand && (
            <Link
              href="/dashboard/brand"
              className="animate-fade-up-delay-2 btn-primary mt-8"
            >
              Go to your dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Search card */}
        <div className="relative mx-auto mt-12 max-w-2xl">
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl shadow-terracotta/5 backdrop-blur-sm sm:p-8">
            <h2 className="mb-5 text-left text-lg font-semibold text-warm-brown">
              Find creators near you
            </h2>
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
              Preview results free · Sign up as a brand to send deal requests
            </p>
          </div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="border-y border-cream-dark bg-white/70 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {STATS.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="card card-hover text-center !p-8"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta/10 to-sage-light/30">
                <Icon className="h-7 w-7 text-terracotta" />
              </div>
              <h3 className="text-lg font-bold text-warm-brown">{label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-warm-gray">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-warm-brown">How it works</h2>
            <p className="mt-3 text-warm-gray">
              Three simple steps from search to signed deal
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ step, title, desc, icon: Icon }) => (
              <div
                key={step}
                className="card card-hover relative overflow-hidden !p-6"
              >
                <span className="text-5xl font-bold text-terracotta/15">{step}</span>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/10">
                  <Icon className="h-5 w-5 text-terracotta" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-warm-brown">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-warm-gray">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual audience CTA */}
      <section className="border-t border-cream-dark bg-gradient-to-br from-terracotta/5 via-cream to-sage-light/10 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          <div className="card card-hover !border-terracotta/20 !bg-white">
            <Building2 className="h-8 w-8 text-terracotta" />
            <h3 className="mt-4 text-xl font-bold text-warm-brown">For businesses</h3>
            <p className="mt-2 text-sm leading-relaxed text-warm-gray">
              Search verified creators, shortlist your favourites, and send structured
              deal requests with budget and deliverables.
            </p>
            <Link href="/signup/brand" className="btn-primary mt-6 !text-sm">
              Create brand account
            </Link>
          </div>

          <div className="card card-hover !border-sage/30 !bg-white">
            <Camera className="h-8 w-8 text-sage-dark" />
            <h3 className="mt-4 text-xl font-bold text-warm-brown">For creators</h3>
            <p className="mt-2 text-sm leading-relaxed text-warm-gray">
              Claim your profile, receive collab offers from local brands, and manage
              everything from your private dashboard.
            </p>
            <Link href="/signup/creator" className="btn-secondary mt-6 !text-sm">
              Join as creator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
