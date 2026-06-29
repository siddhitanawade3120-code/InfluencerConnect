import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { InquiryList } from "@/components/InquiryList";

export default async function BrandInquiriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/brand/inquiries");
  if (user.role !== "BRAND") redirect("/dashboard/creator/inquiries");

  return (
    <div className="page-gradient mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/brand"
            className="text-sm text-warm-gray hover:text-terracotta"
          >
            ← Brand dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-warm-brown">Deal requests</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Track collabs you&apos;ve sent to creators
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="card mt-8 !p-0 overflow-hidden">
        <InquiryList
          role="brand"
          emptyMessage="No deal requests yet. Browse creators and send your first collab offer."
        />
      </div>

      <Link href="/results" className="btn-primary mt-6 !text-sm">
        Find creators to collaborate with
      </Link>
    </div>
  );
}
