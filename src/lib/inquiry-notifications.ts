import type { InquiryStatus } from "./inquiry-types";

export interface InquiryNotificationPayload {
  inquiryId: string;
  previousStatus: InquiryStatus;
  newStatus: InquiryStatus;
  brandId: string;
  creatorId: string;
  actorRole: "BRAND" | "CREATOR";
}

/** Stub — wire to email/push later */
export function notifyInquiryStatusChange(payload: InquiryNotificationPayload): void {
  console.log("[InquiryNotification]", {
    type: "INQUIRY_STATUS_CHANGED",
    ...payload,
    at: new Date().toISOString(),
  });
}

export function notifyNewInquiry(payload: {
  inquiryId: string;
  brandId: string;
  creatorId: string;
  offeredBudget: number;
}): void {
  console.log("[InquiryNotification]", {
    type: "INQUIRY_CREATED",
    ...payload,
    at: new Date().toISOString(),
  });
}

export function notifyNewMessage(payload: {
  inquiryId: string;
  senderRole: "BRAND" | "CREATOR";
  senderId: string;
}): void {
  console.log("[InquiryNotification]", {
    type: "INQUIRY_MESSAGE",
    ...payload,
    at: new Date().toISOString(),
  });
}
