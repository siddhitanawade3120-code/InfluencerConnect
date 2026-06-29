import type { Inquiry, Message, User, BrandProfile, Creator } from "@prisma/client";
import type {
  EnrichedInquiry,
  InquiryMessage,
  InquiryRecord,
} from "./inquiry-types";
import { isInquiryStatus } from "./inquiry-types";

export function serializeInquiry(row: Inquiry): InquiryRecord {
  return {
    id: row.id,
    brandId: row.brandId,
    creatorId: row.creatorId,
    status: isInquiryStatus(row.status) ? row.status : "PENDING",
    offeredBudget: row.offeredBudget,
    deliverables: row.deliverables,
    deadline: row.deadline?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializeMessage(row: Message): InquiryMessage {
  return {
    id: row.id,
    inquiryId: row.inquiryId,
    senderRole: row.senderRole as InquiryMessage["senderRole"],
    senderId: row.senderId,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

export function enrichInquiry(
  row: Inquiry,
  extras: {
    brand?: (User & { brandProfile: BrandProfile | null }) | null;
    creator?: Creator | null;
    messageCount?: number;
  } = {}
): EnrichedInquiry {
  const base = serializeInquiry(row);
  return {
    ...base,
    messageCount: extras.messageCount,
    brand: extras.brand
      ? {
          id: extras.brand.id,
          name: extras.brand.name,
          businessName: extras.brand.brandProfile?.businessName ?? extras.brand.name,
        }
      : undefined,
    creator: extras.creator
      ? {
          id: extras.creator.id,
          instagramHandle: extras.creator.instagramHandle,
          fullName: extras.creator.fullName,
          profilePicUrl: extras.creator.profilePicUrl,
        }
      : undefined,
  };
}
