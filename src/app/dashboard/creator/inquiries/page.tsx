import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { InquiryList } from "@/components/InquiryList";

export default async function CreatorInquiriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/creator/inquiries");
  if (user.role !== "CREATOR") redirect("/dashboard/brand/inquiries");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/creator"
            className="text-sm text-warm-gray hover:text-terracotta"
          >
            ← Creator dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-warm-brown">Deal requests</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Incoming collab offers from local brands
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8">
        <InquiryList
          role="creator"
          emptyMessage="No deal requests yet. When a brand sends you an offer, it will appear here."
        />
      </div>
    </div>
  );
}
