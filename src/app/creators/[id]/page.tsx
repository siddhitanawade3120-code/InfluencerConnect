import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  ShieldCheck,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  withMongo,
  docToCreator,
  isValidObjectId,
  ObjectId,
  type CreatorDocument,
} from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { computeMatchScore } from "@/lib/match-score";
import { canViewCreatorProfile } from "@/lib/marketplace-access";
import {
  formatFollowers,
  formatRate,
  isRecentlyVerified,
  getFollowerTier,
  FOLLOWER_TIERS,
} from "@/lib/types";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { CreatorProfileActions } from "@/components/CreatorProfileActions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLLECTION = "Creator";

type PageProps = { params: Promise<{ id: string }> };

export default async function CreatorProfilePage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  const doc = await withMongo((db) =>
    db.collection<CreatorDocument>(COLLECTION).findOne({ _id: new ObjectId(id) })
  );

  if (!doc) notFound();

  const user = await getCurrentUser();
  if (!canViewCreatorProfile(user, id)) {
    redirect("/dashboard/creator");
  }

  const creator = docToCreator(doc);
  const fresh = isRecentlyVerified(creator.lastVerifiedDate);
  const tier = FOLLOWER_TIERS.find((t) => t.id === getFollowerTier(creator.followerCount));

  const brandProfile = user?.role === "BRAND" ? user.brandProfile : null;
  const matchScore = brandProfile
    ? computeMatchScore(creator, {
        brandBudgetMin: brandProfile.budgetMin,
        brandBudgetMax: brandProfile.budgetMax,
      })
    : null;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-cream/40">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/results"
          className="mb-6 inline-flex items-center gap-1 text-sm text-warm-gray hover:text-terracotta"
        >
          <ArrowLeft className="h-4 w-4" /> Back to results
        </Link>

        <div className="overflow-hidden rounded-3xl border border-cream-dark bg-white shadow-sm">
          <div className="bg-gradient-to-br from-terracotta/10 via-cream to-sage-light/20 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-white shadow-md sm:mx-0">
                <CreatorAvatar
                  src={creator.profilePicUrl}
                  alt={creator.fullName}
                  handle={creator.instagramHandle}
                  fill
                />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold text-warm-brown sm:text-3xl">
                    @{creator.instagramHandle}
                  </h1>
                  {fresh && (
                    <BadgeCheck className="h-6 w-6 text-sage" aria-label="Recently verified" />
                  )}
                </div>
                {creator.fullName && (
                  <p className="mt-1 text-lg text-warm-gray">{creator.fullName}</p>
                )}
                <p className="mt-2 inline-flex items-center gap-1 text-sm text-warm-gray">
                  <MapPin className="h-4 w-4" />
                  {creator.area}, {creator.city}
                </p>
                {tier && (
                  <p className="mt-1 text-sm text-warm-gray">
                    {tier.label} creator · {tier.range} followers
                  </p>
                )}
                {matchScore != null && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-terracotta/10 px-4 py-1.5 text-sm font-semibold text-terracotta">
                    <Sparkles className="h-4 w-4" />
                    {matchScore}% match for your brand budget
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-gray">
                  Stats
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Followers" value={formatFollowers(creator.followerCount)} />
                  <StatCard
                    label="Engagement"
                    value={`${creator.avgEngagementRate}%`}
                    highlight
                  />
                  <StatCard
                    label="Avg likes"
                    value={
                      creator.avgLikes != null
                        ? formatFollowers(creator.avgLikes)
                        : "—"
                    }
                  />
                  <StatCard
                    label="Avg comments"
                    value={creator.avgComments?.toString() ?? "—"}
                  />
                </div>
                {creator.recentPostCountChecked != null && (
                  <p className="mt-2 text-xs text-warm-gray">
                    Based on {creator.recentPostCountChecked} recent posts checked
                  </p>
                )}
              </section>

              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-gray">
                  Rate band
                </h2>
                <p className="mt-2 text-2xl font-bold text-terracotta">
                  {formatRate(creator.estimatedRateMin, creator.estimatedRateMax)}
                </p>
              </section>

              {creator.nicheTags.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-gray">
                    Niches
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {creator.nicheTags.map((niche) => (
                      <span
                        key={niche}
                        className="rounded-full bg-sage-light/30 px-4 py-1.5 text-sm font-medium text-sage-dark"
                      >
                        {niche}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {creator.contentStyle && (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-gray">
                    Content style
                  </h2>
                  <p className="mt-2 text-warm-brown">{creator.contentStyle}</p>
                </section>
              )}

              {creator.previousBrandCollabs && (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-gray">
                    Previous brand collabs
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-warm-brown">
                    {creator.previousBrandCollabs}
                  </p>
                </section>
              )}

              {creator.language && creator.language.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-gray">
                    Languages
                  </h2>
                  <p className="mt-2 text-warm-brown">{creator.language.join(", ")}</p>
                </section>
              )}

              <div className="flex flex-wrap gap-2">
                {fresh && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage-light/30 px-3 py-1 text-xs font-medium text-sage-dark">
                    <Clock className="h-3 w-3" />
                    Verified {creator.lastVerifiedDate}
                  </span>
                )}
                {creator.avgEngagementRate >= 6 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage-light/30 px-3 py-1 text-xs font-medium text-sage-dark">
                    <ShieldCheck className="h-3 w-3" />
                    Strong engagement
                  </span>
                )}
                {creator.accountType && (
                  <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-warm-gray">
                    {creator.accountType} account
                  </span>
                )}
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-[73px] rounded-2xl border border-cream-dark bg-cream/50 p-5">
                <h2 className="mb-4 font-semibold text-warm-brown">Work with this creator</h2>
                <CreatorProfileActions creator={creator} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-cream p-4 text-center">
      <p className={`text-xl font-bold ${highlight ? "text-sage" : "text-warm-brown"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-warm-gray">{label}</p>
    </div>
  );
}
