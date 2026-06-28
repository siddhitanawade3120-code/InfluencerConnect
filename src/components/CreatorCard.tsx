"use client";

import { CreatorAvatar } from "./CreatorAvatar";
import {
  BadgeCheck,
  ShieldCheck,
  UserPlus,
  Check,
  ExternalLink,
  Clock,
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
import { instagramProfileUrl } from "@/lib/instagram-links";
import { useState } from "react";

interface CreatorCardProps {
  creator: Creator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const { isInShortlist, addToShortlist, removeFromShortlist, isSignedUp } = useApp();
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const shortlisted = isInShortlist(creator.id);
  const fresh = isRecentlyVerified(creator.lastVerifiedDate);

  const handleShortlist = () => {
    if (shortlisted) removeFromShortlist(creator.id);
    else addToShortlist(creator.id);
  };

  const handleViewProfile = () => {
    if (!isSignedUp) setShowSignup(true);
    else setShowProfile(true);
  };

  return (
    <>
      <article className="flex flex-col overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-cream-dark">
              <CreatorAvatar src={creator.profilePicUrl} alt={creator.fullName} fill />
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
        </div>

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
            <button
              type="button"
              onClick={handleViewProfile}
              className="flex items-center justify-center gap-1 rounded-xl border border-cream-dark px-4 py-2.5 text-sm font-medium text-warm-gray hover:border-terracotta-light hover:text-terracotta"
            >
              View
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
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

      {showProfile && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full">
                <CreatorAvatar src={creator.profilePicUrl} alt={creator.fullName} fill />
              </div>
              <div>
                <h3 className="text-xl font-bold">@{creator.instagramHandle}</h3>
                <p className="text-warm-gray">{creator.fullName}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-cream p-3">
                <p className="font-bold">{formatFollowers(creator.followerCount)}</p>
                <p className="text-xs text-warm-gray">Followers</p>
              </div>
              <div className="rounded-xl bg-cream p-3">
                <p className="font-bold">{creator.avgEngagementRate}%</p>
                <p className="text-xs text-warm-gray">Engagement</p>
              </div>
              <div className="rounded-xl bg-cream p-3">
                <p className="font-bold">
                  {creator.recentPostCountChecked ?? "—"}
                </p>
                <p className="text-xs text-warm-gray">Posts checked</p>
              </div>
            </div>

            {creator.contentStyle && (
              <p className="mt-4 text-sm text-warm-gray">
                Content: {creator.contentStyle}
              </p>
            )}
            {creator.previousBrandCollabs && (
              <p className="mt-2 text-sm text-warm-gray">
                Collabs: {creator.previousBrandCollabs}
              </p>
            )}
            {creator.language && creator.language.length > 0 && (
              <p className="mt-2 text-sm text-warm-gray">
                Languages: {creator.language.join(", ")}
              </p>
            )}

            <p className="mt-4 rounded-xl bg-cream p-3 text-sm">
              <span className="font-semibold text-warm-brown">Contact: </span>
              {creator.contactValue}
              <span className="text-warm-gray"> ({creator.contactMethod.replace("_", " ")})</span>
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <InstagramDmButton handle={creator.instagramHandle} className="w-full" />
              <a
                href={instagramProfileUrl(creator.instagramHandle)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-cream-dark py-2.5 text-sm font-medium text-warm-gray hover:bg-cream"
              >
                View on Instagram
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowProfile(false)}
              className="mt-4 w-full rounded-xl bg-terracotta py-3 font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
