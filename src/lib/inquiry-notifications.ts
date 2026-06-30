import { prisma } from "@/lib/prisma";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import type { InquiryAction, InquiryStatus } from "@/lib/inquiry-types";
import {
  newDealEmailForCreator,
  statusChangeEmailForBrand,
  statusChangeEmailForCreator,
} from "@/lib/inquiry-email-templates";

export interface InquiryNotificationPayload {
  inquiryId: string;
  previousStatus: InquiryStatus;
  newStatus: InquiryStatus;
  brandId: string;
  creatorId: string;
  actorRole: "BRAND" | "CREATOR";
  action: InquiryAction;
  offeredBudget: number;
  previousBudget?: number;
  note?: string;
}

async function getInquiryParties(brandId: string, creatorDirectoryId: string) {
  const [brand, creatorProfile, creator] = await Promise.all([
    prisma.user.findUnique({
      where: { id: brandId },
      include: { brandProfile: true },
    }),
    prisma.creatorProfile.findFirst({
      where: { creatorId: creatorDirectoryId },
      include: { user: true },
    }),
    prisma.creator.findUnique({ where: { id: creatorDirectoryId } }),
  ]);

  return {
    brand,
    creatorUser: creatorProfile?.user ?? null,
    creator,
  };
}

function logSkipped(type: string, reason: string, meta?: object) {
  console.log("[InquiryNotification]", { type, skipped: reason, ...meta, at: new Date().toISOString() });
}

/** Await in API routes — Netlify serverless kills fire-and-forget work after the response. */
export async function notifyNewInquiry(payload: {
  inquiryId: string;
  brandId: string;
  creatorId: string;
  offeredBudget: number;
}): Promise<void> {
  try {
    await sendNewInquiryEmail(payload);
  } catch (err) {
    console.error("[InquiryNotification] INQUIRY_CREATED failed:", err);
  }
}

export async function notifyInquiryStatusChange(payload: InquiryNotificationPayload): Promise<void> {
  try {
    await sendStatusChangeEmail(payload);
  } catch (err) {
    console.error("[InquiryNotification] INQUIRY_STATUS_CHANGED failed:", err);
  }
}

async function sendNewInquiryEmail(payload: {
  inquiryId: string;
  brandId: string;
  creatorId: string;
  offeredBudget: number;
}): Promise<void> {
  if (!isEmailConfigured()) {
    logSkipped("INQUIRY_CREATED", "email not configured", payload);
    return;
  }

  const inquiry = await prisma.inquiry.findUnique({ where: { id: payload.inquiryId } });
  if (!inquiry) return;

  const { brand, creatorUser, creator } = await getInquiryParties(
    payload.brandId,
    payload.creatorId
  );

  if (!creatorUser?.email) {
    logSkipped("INQUIRY_CREATED", "no registered creator account for creatorId", {
      ...payload,
      creatorHandle: creator?.instagramHandle,
    });
    return;
  }

  const brandName = brand?.brandProfile?.businessName ?? brand?.name ?? "A brand";
  const deadline = inquiry.deadline
    ? inquiry.deadline.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const email = newDealEmailForCreator({
    inquiryId: payload.inquiryId,
    brandName,
    offeredBudget: payload.offeredBudget,
    deliverables: inquiry.deliverables,
    deadline,
  });

  const sent = await sendEmail({ to: creatorUser.email, ...email });
  console.log("[InquiryNotification] INQUIRY_CREATED", creatorUser.email, sent ? "sent" : "failed");
}

async function sendStatusChangeEmail(payload: InquiryNotificationPayload): Promise<void> {
  if (!isEmailConfigured()) {
    logSkipped("INQUIRY_STATUS_CHANGED", "email not configured", payload);
    return;
  }

  const { brand, creatorUser, creator } = await getInquiryParties(
    payload.brandId,
    payload.creatorId
  );

  const brandName = brand?.brandProfile?.businessName ?? brand?.name ?? "Brand";
  const creatorName = creator?.fullName ?? "Creator";
  const creatorHandle = creator?.instagramHandle ?? "creator";

  if (payload.actorRole === "CREATOR") {
    if (!brand?.email) {
      logSkipped("INQUIRY_STATUS_CHANGED", "brand email not found", payload);
      return;
    }

    const email = statusChangeEmailForBrand({
      inquiryId: payload.inquiryId,
      creatorName,
      creatorHandle,
      action: payload.action,
      previousStatus: payload.previousStatus,
      newStatus: payload.newStatus,
      offeredBudget: payload.offeredBudget,
      previousBudget: payload.previousBudget,
      note: payload.note,
    });

    const sent = await sendEmail({ to: brand.email, ...email });
    console.log("[InquiryNotification] INQUIRY_STATUS_CHANGED brand", brand.email, sent ? "sent" : "failed");
    return;
  }

  if (!creatorUser?.email) {
    logSkipped("INQUIRY_STATUS_CHANGED", "no registered creator account for creatorId", {
      ...payload,
      creatorHandle: creator?.instagramHandle,
    });
    return;
  }

  const email = statusChangeEmailForCreator({
    inquiryId: payload.inquiryId,
    brandName,
    action: payload.action,
    previousStatus: payload.previousStatus,
    newStatus: payload.newStatus,
    offeredBudget: payload.offeredBudget,
    previousBudget: payload.previousBudget,
    note: payload.note,
  });

  const sent = await sendEmail({ to: creatorUser.email, ...email });
  console.log("[InquiryNotification] INQUIRY_STATUS_CHANGED creator", creatorUser.email, sent ? "sent" : "failed");
}
