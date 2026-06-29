import Link from "next/link";
import { Building2, Camera, ArrowRight, Check } from "lucide-react";

const BRAND_BENEFITS = [
  "Filter creators registered on InfluConnect",
  "Match by budget, niche, area & followers",
  "Send deal requests and track collabs",
];

const CREATOR_BENEFITS = [
  "Instagram stats imported automatically",
  "Visible to brands in local search",
  "Private deal dashboard for collabs",
];

export default function SignupPage() {
  return (
    <div className="page-gradient flex min-h-[calc(100vh-57px)] flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-warm-brown">Get started free</h1>
          <p className="mt-3 text-warm-gray">
            Creators join the directory · Businesses filter and hire
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link
            href="/signup/brand"
            className="group card card-hover flex flex-col !p-6 !border-terracotta/20"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta/15 to-terracotta-light/20">
              <Building2 className="h-7 w-7 text-terracotta" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-warm-brown">I&apos;m a Business</h2>
            <p className="mt-2 text-sm leading-relaxed text-warm-gray">
              Cloud kitchen, restaurant, cafe, or bakery — sign up, filter our registered
              creators, and send deal requests.
            </p>
            <ul className="mt-4 flex-1 space-y-2">
              {BRAND_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-warm-gray">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                  {b}
                </li>
              ))}
            </ul>
            <span className="btn-primary mt-6 w-full group-hover:shadow-md">
              Create brand account
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            href="/signup/creator"
            className="group card card-hover flex flex-col !p-6 !border-sage/30"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-light/40 to-sage/20">
              <Camera className="h-7 w-7 text-sage-dark" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-warm-brown">I&apos;m a Creator</h2>
            <p className="mt-2 text-sm leading-relaxed text-warm-gray">
              Food or lifestyle influencer ready for brand collabs in Vasai-Virar.
              Your Instagram profile is imported automatically on signup.
            </p>
            <ul className="mt-4 flex-1 space-y-2">
              {CREATOR_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-warm-gray">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                  {b}
                </li>
              ))}
            </ul>
            <span className="btn-secondary mt-6 w-full group-hover:border-sage">
              Join as creator
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <p className="mt-10 text-center text-sm text-warm-gray">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-terracotta hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
