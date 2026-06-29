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

  if (profile?.creatorId) {
    const row = await prisma.creator.findUnique({
      where: { id: profile.creatorId },
    });
    if (row) linkedCreator = dbToCreator(row);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
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

      <div className="mt-8 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-warm-brown">Account</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-warm-gray">Instagram</dt>
            <dd className="font-medium">@{profile?.instagramHandle ?? "—"}</dd>
          </div>
          {user.phone && (
            <div>
              <dt className="text-warm-gray">Phone</dt>
              <dd className="font-medium">{user.phone}</dd>
            </div>
          )}
          {profile?.bio && (
            <div className="sm:col-span-2">
              <dt className="text-warm-gray">Bio</dt>
              <dd className="font-medium">{profile.bio}</dd>
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
            When an admin adds @{profile?.instagramHandle} to the directory, your account will
            automatically link on signup. Ask an admin to import your Instagram handle.
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-warm-brown">Deal requests</h2>
          <Link
            href="/dashboard/creator/inquiries"
            className="text-sm font-medium text-terracotta hover:underline"
          >
            View all →
          </Link>
        </div>
        <p className="mt-2 text-sm text-warm-gray">
          Brands can send you collab offers. Accept, counter, or decline — then chat in the thread.
        </p>
      </div>
    </div>
  );
}
