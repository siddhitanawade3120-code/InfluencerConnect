"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { EnrichedInquiry, InquiryRecord } from "@/lib/inquiry-types";
import { InquiryStatusBadge } from "@/components/InquiryStatusBadge";
import { InquiryActions } from "@/components/InquiryActions";
import { InquiryMessageThread } from "@/components/InquiryMessageThread";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { usePolling } from "@/lib/use-polling";

interface InquiryDetailClientProps {
  inquiryId: string;
  viewerRole: "BRAND" | "CREATOR";
  backHref: string;
}

export function InquiryDetailClient({
  inquiryId,
  viewerRole,
  backHref,
}: InquiryDetailClientProps) {
  const fetchInquiry = useCallback(async () => {
    const res = await fetch(`/api/inquiries/${inquiryId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load inquiry");
    return data as EnrichedInquiry;
  }, [inquiryId]);

  const { data: inquiry, loading, error, refresh } = usePolling(fetchInquiry, 10000);
  const [patch, setPatch] = useState<InquiryRecord | null>(null);

  useEffect(() => {
    setPatch(null);
  }, [inquiry?.id, inquiry?.updatedAt]);

  const displayInquiry: EnrichedInquiry | null = inquiry
    ? { ...inquiry, ...(patch ?? {}) }
    : null;

  const handleActionUpdated = useCallback(
    (updated: InquiryRecord) => {
      setPatch(updated);
      void refresh();
    },
    [refresh]
  );

  if (loading && !inquiry) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (error || !displayInquiry) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {error ?? "Inquiry not found"}
      </div>
    );
  }

  return (
    <div>
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1 text-sm text-warm-gray hover:text-terracotta"
      >
        <ArrowLeft className="h-4 w-4" /> Back to deals
      </Link>

      <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {displayInquiry.creator && viewerRole === "BRAND" && (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                <CreatorAvatar
                  src={displayInquiry.creator.profilePicUrl}
                  alt={displayInquiry.creator.fullName}
                  handle={displayInquiry.creator.instagramHandle}
                  fill
                />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-warm-brown">
                  {viewerRole === "BRAND"
                    ? `@${displayInquiry.creator?.instagramHandle ?? "Creator"}`
                    : displayInquiry.brand?.businessName ?? "Brand deal"}
                </h1>
                <InquiryStatusBadge status={displayInquiry.status} />
              </div>
              {viewerRole === "CREATOR" && displayInquiry.brand && (
                <p className="mt-1 text-sm text-warm-gray">
                  From {displayInquiry.brand.businessName} ({displayInquiry.brand.name})
                </p>
              )}
            </div>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-cream p-4">
            <dt className="text-xs font-medium uppercase text-warm-gray">Budget</dt>
            <dd className="mt-1 text-lg font-bold text-terracotta">
              ₹{displayInquiry.offeredBudget.toLocaleString("en-IN")}
            </dd>
          </div>
          <div className="rounded-xl bg-cream p-4 sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-warm-gray">Deliverables</dt>
            <dd className="mt-1 text-sm text-warm-brown">{displayInquiry.deliverables}</dd>
          </div>
          {displayInquiry.deadline && (
            <div className="rounded-xl bg-cream p-4">
              <dt className="text-xs font-medium uppercase text-warm-gray">Deadline</dt>
              <dd className="mt-1 text-sm font-medium text-warm-brown">
                {new Date(displayInquiry.deadline).toLocaleDateString("en-IN")}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 border-t border-cream-dark pt-6">
          <InquiryActions
            inquiry={displayInquiry}
            role={viewerRole}
            onUpdated={handleActionUpdated}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
        <InquiryMessageThread
          inquiryId={inquiryId}
          viewerRole={viewerRole}
          refreshToken={displayInquiry.updatedAt}
        />
      </div>
    </div>
  );
}
