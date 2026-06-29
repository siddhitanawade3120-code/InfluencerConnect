"use client";

import Link from "next/link";
import {
  BadgeCheck,
  ShieldCheck,
  UserPlus,
  Check,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import type { Creator } from "@/lib/types";
import {
  formatFollowers,
  formatRate,
  isRecentlyVerified,
} from "@/lib/types";
import { useApp } from "@/lib/context";
import { SignupModal } from "./SignupModal";
import { InstagramDmButton } from "./InstagramDmButton";
import { CreatorAvatar } from "./CreatorAvatar";
import { useState } from "react";

interface CreatorCardProps {
  creator: Creator;
  showMatchScore?: boolean;
}

export function CreatorCard({ creator, showMatchScore = false }: CreatorCardProps) {
  const { isInShortlist, addToShortlist, removeFromShortlist, isSignedUp } = useApp();
  const [showSignup, setShowSignup] = useState(false);
  const shortlisted = isInShortlist(creator.id);
  const fresh = isRecentlyVerified(creator.lastVerifiedDate);

  const handleShortlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (shortlisted) removeFromShortlist(creator.id);
    else addToShortlist(creator.id);
  };

  return (
    <>
      <article className="flex flex-col overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm transition-shadow hover:shadow-md">
        <Link href={`/creators/${creator.id}`} className="block p-5 hover:bg-cream/30">
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-cream-dark">
              <CreatorAvatar
                src={creator.profilePicUrl}
                alt={creator.fullName}
                handle={creator.instagramHandle}
                fill
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate font-semibold text-warm-brown">
                  @{creator.instagramHandle}
                </h3>
                {fresh && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-sage" aria-label="Recently verified" />
                )}
              </div>
              <p className="text-sm text-warm-gray">
                {creator.area}, {creator.city}
              </p>
            </div>
            {showMatchScore && creator.matchScore != null && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-terracotta/10 px-2.5 py-1 text-xs font-semibold text-terracotta">
                <Sparkles className="h-3 w-3" />
                {creator.matchScore}%
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <div>
              <span className="font-bold text-warm-brown">
                {formatFollowers(creator.followerCount)}
              </span>
              <span className="ml-1 text-warm-gray">followers</span>
            </div>
            <div>
              <span className="font-bold text-sage">{creator.avgEngagementRate}%</span>
              <span className="ml-1 text-warm-gray">engagement</span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {fresh && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sage-light/30 px-2.5 py-0.5 text-xs font-medium text-sage-dark">
                <Clock className="h-3 w-3" />
                Verified {creator.lastVerifiedDate}
              </span>
            )}
            {creator.avgEngagementRate >= 6 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sage-light/30 px-2.5 py-0.5 text-xs font-medium text-sage-dark">
                <ShieldCheck className="h-3 w-3" />
                Strong engagement
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {creator.nicheTags.map((niche) => (
              <span
                key={niche}
                className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-warm-gray"
              >
                {niche}
              </span>
            ))}
          </div>

          <p className="mt-4 text-lg font-bold text-terracotta">
            {formatRate(creator.estimatedRateMin, creator.estimatedRateMax)}
          </p>
        </Link>

        <div className="mt-auto flex flex-col gap-2 border-t border-cream-dark p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShortlist}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                shortlisted
                  ? "bg-sage text-white"
                  : "bg-terracotta text-white hover:bg-terracotta-dark"
              }`}
            >
              {shortlisted ? (
                <>
                  <Check className="h-4 w-4" /> Added
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Add to Shortlist
                </>
              )}
            </button>
            <Link
              href={`/creators/${creator.id}`}
              className="flex items-center justify-center gap-1 rounded-xl border border-cream-dark px-4 py-2.5 text-sm font-medium text-warm-gray hover:border-terracotta-light hover:text-terracotta"
            >
              View
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          {isSignedUp ? (
            <InstagramDmButton handle={creator.instagramHandle} className="w-full" />
          ) : (
            <button
              type="button"
              onClick={() => setShowSignup(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#833AB4]/40 py-2.5 text-sm font-medium text-[#833AB4]"
            >
              Sign up to message on Instagram
            </button>
          )}
        </div>
      </article>

      <SignupModal open={showSignup} onClose={() => setShowSignup(false)} />
    </>
  );
}
