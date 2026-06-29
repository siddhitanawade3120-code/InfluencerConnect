"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { EnrichedInquiry } from "@/lib/inquiry-types";
import { InquiryStatusBadge } from "@/components/InquiryStatusBadge";
import { CreatorAvatar } from "@/components/CreatorAvatar";

interface InquiryListProps {
  role: "brand" | "creator";
  emptyMessage: string;
}

export function InquiryList({ role, emptyMessage }: InquiryListProps) {
  const [inquiries, setInquiries] = useState<EnrichedInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinked, setUnlinked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/inquiries?role=${role}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setInquiries(data.inquiries ?? []);
        setUnlinked(!!data.unlinked);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [role]);

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-warm-gray">
        <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
      </div>
    );
  }

  if (error) {
    return <p className="p-6 text-sm text-red-600">{error}</p>;
  }

  if (unlinked) {
    return (
      <div className="p-6 text-sm text-warm-gray">
        <p className="font-semibold text-warm-brown">Profile not linked yet</p>
        <p className="mt-2 leading-relaxed">
          Deal requests appear here once your Instagram handle is linked to a directory profile.
          Check your creator dashboard for linking status.
        </p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-warm-gray">
        <p className="text-base font-medium text-warm-brown">No deals yet</p>
        <p className="mt-2 leading-relaxed">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-cream-dark">
      {inquiries.map((inquiry) => (
        <li key={inquiry.id}>
          <Link
            href={`/dashboard/inquiries/${inquiry.id}`}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-cream/50"
          >
            {role === "brand" && inquiry.creator && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                <CreatorAvatar
                  src={inquiry.creator.profilePicUrl}
                  alt={inquiry.creator.fullName}
                  handle={inquiry.creator.instagramHandle}
                  fill
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-warm-brown">
                  {role === "brand"
                    ? `@${inquiry.creator?.instagramHandle ?? "Creator"}`
                    : inquiry.brand?.businessName ?? "Brand"}
                </p>
                <InquiryStatusBadge status={inquiry.status} />
              </div>
              <p className="mt-1 truncate text-sm text-warm-gray">
                ₹{inquiry.offeredBudget.toLocaleString("en-IN")} · {inquiry.deliverables}
              </p>
              <p className="mt-1 text-xs text-warm-gray">
                Updated {new Date(inquiry.updatedAt).toLocaleDateString("en-IN")}
                {inquiry.messageCount != null && inquiry.messageCount > 0
                  ? ` · ${inquiry.messageCount} message${inquiry.messageCount !== 1 ? "s" : ""}`
                  : ""}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
