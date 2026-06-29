import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Handshake, Users, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";

export default async function BrandDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/brand");
  if (user.role !== "BRAND") redirect("/dashboard/creator");

  const profile = user.brandProfile;

  const [pendingCount, activeCount] = await Promise.all([
    prisma.inquiry.count({
      where: { brandId: user.id, status: "PENDING" },
    }),
    prisma.inquiry.count({
      where: {
        brandId: user.id,
        status: { in: ["PENDING", "NEGOTIATING", "CONFIRMED", "DELIVERED"] },
      },
    }),
  ]);

  return (
    <div className="page-gradient mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">
            Brand dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold text-warm-brown">
            {profile?.businessName ?? user.name}
          </h1>
          <p className="mt-1 text-sm text-warm-gray">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/results"
          className="card card-hover group flex flex-col !p-5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta/10">
            <Search className="h-5 w-5 text-terracotta" />
          </div>
          <p className="mt-4 font-semibold text-warm-brown">Find creators</p>
          <p className="mt-1 text-sm text-warm-gray">Browse and shortlist</p>
          <ArrowRight className="mt-3 h-4 w-4 text-terracotta opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>

        <Link
          href="/dashboard/brand/inquiries"
          className="card card-hover group flex flex-col !p-5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-light/40">
            <Handshake className="h-5 w-5 text-sage-dark" />
          </div>
          <p className="mt-4 font-semibold text-warm-brown">Your deals</p>
          <p className="mt-1 text-sm text-warm-gray">
            {activeCount > 0
              ? `${activeCount} active deal${activeCount !== 1 ? "s" : ""}`
              : "No active deals yet"}
          </p>
          {pendingCount > 0 && (
            <span className="mt-2 inline-flex w-fit rounded-full bg-terracotta/10 px-3 py-0.5 text-xs font-semibold text-terracotta">
              {pendingCount} awaiting response
            </span>
          )}
        </Link>

        <Link
          href="/shortlist"
          className="card card-hover group flex flex-col !p-5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream-dark">
            <Users className="h-5 w-5 text-warm-brown" />
          </div>
          <p className="mt-4 font-semibold text-warm-brown">Shortlist</p>
          <p className="mt-1 text-sm text-warm-gray">Track outreach pipeline</p>
          <ArrowRight className="mt-3 h-4 w-4 text-terracotta opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-warm-brown">Your business profile</h2>
        {profile ? (
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-cream/60 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-warm-gray">
                Contact
              </dt>
              <dd className="mt-1 font-semibold text-warm-brown">{user.name}</dd>
            </div>
            <div className="rounded-xl bg-cream/60 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-warm-gray">
                Category
              </dt>
              <dd className="mt-1 font-semibold text-warm-brown">{profile.category}</dd>
            </div>
            <div className="rounded-xl bg-cream/60 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-warm-gray">
                Location
              </dt>
              <dd className="mt-1 font-semibold text-warm-brown">
                {profile.area}, {profile.city}
              </dd>
            </div>
            <div className="rounded-xl bg-cream/60 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-warm-gray">
                Budget per post
              </dt>
              <dd className="mt-1 font-semibold text-terracotta">
                ₹{profile.budgetMin.toLocaleString()} – ₹{profile.budgetMax.toLocaleString()}
              </dd>
            </div>
            {user.phone && (
              <div className="rounded-xl bg-cream/60 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-warm-gray">
                  Phone
                </dt>
                <dd className="mt-1 font-semibold text-warm-brown">{user.phone}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-4 text-sm text-warm-gray">No brand profile found.</p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-terracotta/20 bg-gradient-to-r from-terracotta/5 to-sage-light/10 p-6">
        <h2 className="text-lg font-semibold text-warm-brown">Ready to collaborate?</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Browse creators in your area, send deal requests with your budget, and track everything
          from negotiation to delivery.
        </p>
        <Link href="/results" className="btn-primary mt-4 !text-sm">
          <Search className="h-4 w-4" />
          Find creators now
        </Link>
      </div>
    </div>
  );
}
