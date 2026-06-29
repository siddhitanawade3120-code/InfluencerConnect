import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default async function BrandDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/brand");
  if (user.role !== "BRAND") redirect("/dashboard/creator");

  const profile = user.brandProfile;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-terracotta">Brand dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-warm-brown">
            {profile?.businessName ?? user.name}
          </h1>
          <p className="mt-1 text-sm text-warm-gray">Signed in as {user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-warm-brown">Your profile</h2>
        {profile ? (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-warm-gray">Contact name</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-warm-gray">Category</dt>
              <dd className="font-medium">{profile.category}</dd>
            </div>
            <div>
              <dt className="text-warm-gray">Location</dt>
              <dd className="font-medium">{profile.area}, {profile.city}</dd>
            </div>
            <div>
              <dt className="text-warm-gray">Budget per post</dt>
              <dd className="font-medium">₹{profile.budgetMin.toLocaleString()} – ₹{profile.budgetMax.toLocaleString()}</dd>
            </div>
            {user.phone && (
              <div>
                <dt className="text-warm-gray">Phone</dt>
                <dd className="font-medium">{user.phone}</dd>
              </div>
            )}
            {profile.website && (
              <div>
                <dt className="text-warm-gray">Website</dt>
                <dd className="font-medium">{profile.website}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-4 text-sm text-warm-gray">No brand profile found.</p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-warm-brown">Deals & collabs</h2>
          <Link
            href="/dashboard/brand/inquiries"
            className="text-sm font-medium text-terracotta hover:underline"
          >
            View all →
          </Link>
        </div>
        <p className="mt-2 text-sm text-warm-gray">
          Send deal requests from creator profiles, then track negotiation and delivery here.
        </p>
        <Link
          href="/results"
          className="mt-4 inline-block rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-dark"
        >
          Find creators to collaborate with
        </Link>
      </div>
    </div>
  );
}
