import { after } from "next/server";
import {
  notifyInquiryStatusChange,
  notifyNewInquiry,
  type InquiryNotificationPayload,
} from "@/lib/inquiry-notifications";

/** Send inquiry emails after the HTTP response (keeps status updates fast). */
export function scheduleInquiryStatusEmail(payload: InquiryNotificationPayload): void {
  after(async () => {
    await notifyInquiryStatusChange(payload);
  });
}

export function scheduleNewInquiryEmail(payload: {
  inquiryId: string;
  brandId: string;
  creatorId: string;
  offeredBudget: number;
}): void {
  after(async () => {
    await notifyNewInquiry(payload);
  });
}
