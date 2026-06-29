import type { Inquiry, User } from "@prisma/client";
import type { CurrentUser } from "@/lib/auth";
import {
  type InquiryAction,
  type InquiryStatus,
  TERMINAL_STATUSES,
  isInquiryStatus,
} from "./inquiry-types";

export class InquiryAccessError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export function getCreatorDirectoryId(user: CurrentUser): string | null {
  return user.creatorProfile?.creatorId ?? null;
}

export function isBrandParticipant(user: CurrentUser, inquiry: Inquiry): boolean {
  return user.role === "BRAND" && inquiry.brandId === user.id;
}

export function isCreatorParticipant(user: CurrentUser, inquiry: Inquiry): boolean {
  const creatorId = getCreatorDirectoryId(user);
  return user.role === "CREATOR" && !!creatorId && inquiry.creatorId === creatorId;
}

export function assertInquiryParticipant(user: CurrentUser, inquiry: Inquiry): void {
  if (!isBrandParticipant(user, inquiry) && !isCreatorParticipant(user, inquiry)) {
    throw new InquiryAccessError("You do not have access to this inquiry");
  }
}

export function resolveStatusAfterAction(
  action: InquiryAction,
  current: InquiryStatus,
  role: User["role"]
): InquiryStatus {
  if (TERMINAL_STATUSES.includes(current)) {
    throw new InquiryAccessError(`Cannot update inquiry in ${current} status`, 400);
  }

  switch (action) {
    case "ACCEPT":
      if (role !== "CREATOR") {
        throw new InquiryAccessError("Only creators can accept deals");
      }
      if (current !== "PENDING" && current !== "NEGOTIATING") {
        throw new InquiryAccessError("Can only accept pending or negotiating deals", 400);
      }
      return "CONFIRMED";

    case "DECLINE":
      if (role !== "CREATOR") {
        throw new InquiryAccessError("Only creators can decline deals");
      }
      if (current !== "PENDING" && current !== "NEGOTIATING") {
        throw new InquiryAccessError("Can only decline pending or negotiating deals", 400);
      }
      return "DECLINED";

    case "COUNTER":
      if (current !== "PENDING" && current !== "NEGOTIATING") {
        throw new InquiryAccessError("Can only counter pending or negotiating deals", 400);
      }
      return "NEGOTIATING";

    case "CONFIRM":
      if (role !== "BRAND") {
        throw new InquiryAccessError("Only brands can confirm negotiated terms");
      }
      if (current !== "NEGOTIATING") {
        throw new InquiryAccessError("Can only confirm while negotiating", 400);
      }
      return "CONFIRMED";

    case "MARK_DELIVERED":
      if (role !== "CREATOR") {
        throw new InquiryAccessError("Only creators can mark content as delivered");
      }
      if (current !== "CONFIRMED") {
        throw new InquiryAccessError("Can only mark delivered after deal is confirmed", 400);
      }
      return "DELIVERED";

    case "MARK_COMPLETED":
      if (role !== "BRAND") {
        throw new InquiryAccessError("Only brands can mark deals as completed");
      }
      if (current !== "DELIVERED") {
        throw new InquiryAccessError("Can only complete after delivery", 400);
      }
      return "COMPLETED";

    case "CANCEL":
      if (role !== "BRAND") {
        throw new InquiryAccessError("Only brands can cancel deals");
      }
      if (TERMINAL_STATUSES.includes(current) || current === "DELIVERED") {
        throw new InquiryAccessError("Cannot cancel this inquiry", 400);
      }
      return "CANCELLED";

    default:
      throw new InquiryAccessError("Unknown action", 400);
  }
}

export function parseInquiryAction(value: unknown): InquiryAction {
  const actions = [
    "ACCEPT",
    "DECLINE",
    "COUNTER",
    "CONFIRM",
    "MARK_DELIVERED",
    "MARK_COMPLETED",
    "CANCEL",
  ] as const;
  if (typeof value === "string" && actions.includes(value as InquiryAction)) {
    return value as InquiryAction;
  }
  throw new InquiryAccessError("Invalid action", 400);
}

export function parseStatus(value: unknown): InquiryStatus {
  if (typeof value === "string" && isInquiryStatus(value)) {
    return value;
  }
  throw new InquiryAccessError("Invalid status", 400);
}
