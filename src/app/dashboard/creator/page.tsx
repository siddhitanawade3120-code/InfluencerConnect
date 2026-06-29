import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { dbToCreator } from "@/lib/creator-mapper";
import { formatFollowers, formatRate } from "@/lib/types";

export default async function CreatorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/creator");
  if (user.role !== "CREATOR") redirect("/dashboard/brand");

  const profile = user.creatorProfile;
  let linkedCreator = null;
  let pendingCount = 0;
  let activeCount = 0;

  if (profile?.creatorId) {
    const [row, pending, active] = await Promise.all([
      prisma.creator.findUnique({ where: { id: profile.creatorId } }),
      prisma.inquiry.count({
        where: { creatorId: profile.creatorId, status: "PENDING" },
      }),
      prisma.inquiry.count({
        where: {
          creatorId: profile.creatorId,
          status: { in: ["PENDING", "NEGOTIATING", "CONFIRMED", "DELIVERED"] },
        },
      }),
    ]);
    if (row) linkedCreator = dbToCreator(row);
    pendingCount = pending;
    activeCount = active;
  }

  return (
    <div className="page-gradient mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-sage-dark">Creator dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-warm-brown">{user.name}</h1>
          <p className="mt-1 text-sm text-warm-gray">
            @{profile?.instagramHandle ?? "—"} · {user.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="card mt-8">
        <h2 className="text-lg font-semibold text-warm-brown">Account</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-cream/60 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-warm-gray">Instagram</dt>
            <dd className="mt-1 font-semibold">@{profile?.instagramHandle ?? "—"}</dd>
          </div>
          {user.phone && (
            <div className="rounded-xl bg-cream/60 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-warm-gray">Phone</dt>
              <dd className="mt-1 font-semibold">{user.phone}</dd>
            </div>
          )}
          {profile?.bio && (
            <div className="rounded-xl bg-cream/60 p-4 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-warm-gray">Bio</dt>
              <dd className="mt-1 font-medium">{profile.bio}</dd>
            </div>
          )}
        </dl>
      </div>

      {linkedCreator ? (
        <div className="mt-6 rounded-2xl border border-sage/30 bg-sage-light/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-sage-dark">
            Claimed InfluConnect profile
          </p>
          <div className="mt-4 flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
              <CreatorAvatar
                src={linkedCreator.profilePicUrl}
                alt={linkedCreator.fullName}
                handle={linkedCreator.instagramHandle}
                fill
              />
            </div>
            <div>
              <p className="font-bold text-warm-brown">@{linkedCreator.instagramHandle}</p>
              <p className="text-sm text-warm-gray">{linkedCreator.fullName}</p>
              <p className="mt-2 text-sm">
                {formatFollowers(linkedCreator.followerCount)} followers ·{" "}
                {linkedCreator.avgEngagementRate}% engagement
              </p>
              <p className="text-sm text-warm-gray">
                {formatRate(linkedCreator.estimatedRateMin, linkedCreator.estimatedRateMax)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-cream-dark bg-cream/50 p-6 text-sm text-warm-gray">
            <p className="font-medium text-warm-brown">No linked profile yet</p>
          <p className="mt-1">
            Your handle is <strong>@{profile?.instagramHandle}</strong>. An admin must add this
            handle to the directory first — then your account links automatically and brands can
            send you deals. Contact support if your handle is already listed but not linked.
          </p>
        </div>
      )}

      <div className="card mt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-warm-brown">Deal requests from brands</h2>
          <Link
            href="/dashboard/creator/inquiries"
            className="text-sm font-medium text-terracotta hover:underline"
          >
            View all →
          </Link>
        </div>

        {!profile?.creatorId ? (
          <p className="mt-2 text-sm text-warm-gray">
            Link your Instagram profile first (see above). Once linked, brands can send you collab
            offers here — only you will see deals sent to your profile.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-warm-gray">
              Brands send offers directly to your profile. Accept, counter, or decline — then chat
              in the thread. Your deals are private to you.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {pendingCount > 0 && (
                <span className="rounded-full bg-terracotta/10 px-4 py-1.5 text-sm font-semibold text-terracotta">
                  {pendingCount} new request{pendingCount !== 1 ? "s" : ""}
                </span>
              )}
              {activeCount > 0 && (
                <span className="rounded-full bg-sage-light/40 px-4 py-1.5 text-sm font-medium text-sage-dark">
                  {activeCount} active deal{activeCount !== 1 ? "s" : ""}
                </span>
              )}
              {pendingCount === 0 && activeCount === 0 && (
                <span className="text-sm text-warm-gray">No deals yet — brands will find you in search</span>
              )}
            </div>
            {(pendingCount > 0 || activeCount > 0) && (
              <Link
                href="/dashboard/creator/inquiries"
                className="mt-4 inline-block rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-dark"
              >
                {pendingCount > 0 ? "Review new requests" : "View your deals"}
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
