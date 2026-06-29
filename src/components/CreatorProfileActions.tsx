"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Check, Handshake } from "lucide-react";
import type { Creator } from "@/lib/types";
import { useApp } from "@/lib/context";
import { SignupModal } from "./SignupModal";
import { DealRequestModal } from "./DealRequestModal";
import { InstagramDmButton } from "./InstagramDmButton";
import { instagramProfileUrl } from "@/lib/instagram-links";

interface CreatorProfileActionsProps {
  creator: Creator;
}

export function CreatorProfileActions({ creator }: CreatorProfileActionsProps) {
  const { isInShortlist, addToShortlist, removeFromShortlist, isSignedUp, authLoading, user } =
    useApp();
  const [showSignup, setShowSignup] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const shortlisted = isInShortlist(creator.id);
  const isBrand = user?.role === "BRAND";
  const isCreator = user?.role === "CREATOR";

  const handleShortlist = () => {
    if (shortlisted) removeFromShortlist(creator.id);
    else addToShortlist(creator.id);
  };

  const handleDealRequest = () => {
    if (authLoading) return;
    if (!isSignedUp) {
      setShowSignup(true);
      return;
    }
    if (!isBrand) {
      return;
    }
    setShowDealModal(true);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {!isSignedUp || isBrand ? (
          <button
            type="button"
            onClick={handleDealRequest}
            disabled={authLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta py-3.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:opacity-50"
          >
            <Handshake className="h-4 w-4" />
            Send Deal Request
          </button>
        ) : null}

        {isCreator && (
          <p className="rounded-xl border border-cream-dark bg-cream/50 px-4 py-3 text-center text-sm text-warm-gray">
            This page is for brands.{" "}
            <Link href="/dashboard/creator/inquiries" className="text-terracotta hover:underline">
              View your incoming deals
            </Link>
          </p>
        )}

        {authLoading ? (
          <div className="flex w-full items-center justify-center rounded-xl border border-cream-dark py-3 text-sm text-warm-gray">
            Checking session…
          </div>
        ) : isSignedUp ? (
          <InstagramDmButton handle={creator.instagramHandle} className="w-full" />
        ) : (
          <button
            type="button"
            onClick={() => setShowSignup(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#833AB4]/40 py-3 text-sm font-medium text-[#833AB4]"
          >
            Sign up to message on Instagram
          </button>
        )}

        {!isCreator && (
          <button
            type="button"
            onClick={handleShortlist}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
              shortlisted
                ? "border-sage bg-sage text-white"
                : "border-cream-dark bg-white text-warm-gray hover:border-terracotta-light hover:text-terracotta"
            }`}
          >
            {shortlisted ? (
              <>
                <Check className="h-4 w-4" /> On your shortlist
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> Add to Shortlist
              </>
            )}
          </button>
        )}

        <Link
          href={instagramProfileUrl(creator.instagramHandle)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-sm text-warm-gray hover:text-terracotta"
        >
          View on Instagram →
        </Link>
      </div>

      <SignupModal open={showSignup} onClose={() => setShowSignup(false)} />
      {isBrand && (
        <DealRequestModal
          open={showDealModal}
          onClose={() => setShowDealModal(false)}
          creator={creator}
        />
      )}
    </>
  );
}
