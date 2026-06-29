export const INQUIRY_STATUSES = [
  "PENDING",
  "NEGOTIATING",
  "CONFIRMED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "DECLINED",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export type InquiryAction =
  | "ACCEPT"
  | "DECLINE"
  | "COUNTER"
  | "CONFIRM"
  | "MARK_DELIVERED"
  | "MARK_COMPLETED"
  | "CANCEL";

export type MessageSenderRole = "BRAND" | "CREATOR";

export interface InquiryRecord {
  id: string;
  brandId: string;
  creatorId: string;
  status: InquiryStatus;
  offeredBudget: number;
  deliverables: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryMessage {
  id: string;
  inquiryId: string;
  senderRole: MessageSenderRole;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface InquiryPartyBrand {
  id: string;
  name: string;
  businessName: string;
}

export interface InquiryPartyCreator {
  id: string;
  instagramHandle: string;
  fullName: string;
  profilePicUrl: string;
}

export interface EnrichedInquiry extends InquiryRecord {
  brand?: InquiryPartyBrand;
  creator?: InquiryPartyCreator;
  messageCount?: number;
}

export const TERMINAL_STATUSES: InquiryStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "DECLINED",
];

export function isInquiryStatus(value: string): value is InquiryStatus {
  return (INQUIRY_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(status: InquiryStatus): string {
  const labels: Record<InquiryStatus, string> = {
    PENDING: "Pending",
    NEGOTIATING: "Negotiating",
    CONFIRMED: "Confirmed",
    DELIVERED: "Delivered",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    DECLINED: "Declined",
  };
  return labels[status];
}
