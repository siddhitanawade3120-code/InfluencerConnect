import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertInquiryParticipant,
  InquiryAccessError,
} from "@/lib/inquiry-access";
import { InquiryDetailClient } from "@/components/InquiryDetailClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function InquiryDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect(`/login?redirect=/dashboard/inquiries/${id}`);
  }

  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) notFound();

  try {
    assertInquiryParticipant(user, inquiry);
  } catch (err) {
    if (err instanceof InquiryAccessError) {
      redirect(
        user.role === "BRAND"
          ? "/dashboard/brand/inquiries"
          : "/dashboard/creator/inquiries"
      );
    }
    throw err;
  }

  const backHref =
    user.role === "BRAND" ? "/dashboard/brand/inquiries" : "/dashboard/creator/inquiries";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <InquiryDetailClient
        inquiryId={id}
        viewerRole={user.role}
        backHref={backHref}
      />
    </div>
  );
}
