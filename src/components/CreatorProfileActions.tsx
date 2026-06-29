"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Check, Handshake } from "lucide-react";
import type { Creator } from "@/lib/types";
import { useApp } from "@/lib/context";
import { SignupModal } from "./SignupModal";
import { InstagramDmButton } from "./InstagramDmButton";
import { instagramProfileUrl } from "@/lib/instagram-links";

interface CreatorProfileActionsProps {
  creator: Creator;
}

export function CreatorProfileActions({ creator }: CreatorProfileActionsProps) {
  const { isInShortlist, addToShortlist, removeFromShortlist, isSignedUp } = useApp();
  const [showSignup, setShowSignup] = useState(false);
  const [dealRequested, setDealRequested] = useState(false);
  const shortlisted = isInShortlist(creator.id);

  const handleShortlist = () => {
    if (shortlisted) removeFromShortlist(creator.id);
    else addToShortlist(creator.id);
  };

  const handleDealRequest = () => {
    if (!isSignedUp) {
      setShowSignup(true);
      return;
    }
    setDealRequested(true);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleDealRequest}
          disabled={dealRequested}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta py-3.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:cursor-default disabled:bg-sage"
        >
          <Handshake className="h-4 w-4" />
          {dealRequested ? "Deal request coming soon" : "Send Deal Request"}
        </button>

        {isSignedUp ? (
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
    </>
  );
}
