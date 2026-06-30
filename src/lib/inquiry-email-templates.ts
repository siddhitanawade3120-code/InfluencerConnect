import { inquiryUrl } from "@/lib/app-url";
import { statusLabel, type InquiryAction, type InquiryStatus } from "@/lib/inquiry-types";

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function layoutText(title: string, lines: (string | null)[], ctaUrl: string): string {
  const body = lines.filter(Boolean).join("\n");
  return [
    "InfluConnect",
    "Vasai-Virar creator marketplace",
    "",
    title,
    "—".repeat(Math.min(title.length, 40)),
    "",
    body,
    "",
    `View deal: ${ctaUrl}`,
    "",
    "—",
    "You received this because you have an account on InfluConnect.",
  ].join("\n");
}

export function newDealEmailForCreator(opts: {
  inquiryId: string;
  brandName: string;
  offeredBudget: number;
  deliverables: string;
  deadline: string | null;
}): { subject: string; text: string } {
  const url = inquiryUrl(opts.inquiryId);

  const text = layoutText(
    "New deal request",
    [
      `${opts.brandName} sent you a new deal request.`,
      "",
      `Offer: ${formatInr(opts.offeredBudget)}`,
      `Deliverables: ${opts.deliverables}`,
      opts.deadline ? `Deadline: ${opts.deadline}` : null,
      "",
      "Log in to review, accept, decline, or counter the offer.",
    ],
    url
  );

  return {
    subject: `New deal from ${opts.brandName} — ${formatInr(opts.offeredBudget)}`,
    text,
  };
}

export function statusChangeEmailForBrand(opts: {
  inquiryId: string;
  creatorName: string;
  creatorHandle: string;
  action: InquiryAction;
  previousStatus: InquiryStatus;
  newStatus: InquiryStatus;
  offeredBudget: number;
  previousBudget?: number;
  note?: string;
}): { subject: string; text: string } {
  const url = inquiryUrl(opts.inquiryId);
  const handle = `@${opts.creatorHandle.replace(/^@/, "")}`;

  const actionCopy: Record<InquiryAction, { title: string; line: string }> = {
    ACCEPT: {
      title: "Creator accepted your deal",
      line: `${opts.creatorName} (${handle}) accepted your deal for ${formatInr(opts.offeredBudget)}.`,
    },
    DECLINE: {
      title: "Creator declined your deal",
      line: `${opts.creatorName} (${handle}) declined your deal request.`,
    },
    COUNTER: {
      title: "Creator sent a counter offer",
      line: `${opts.creatorName} (${handle}) proposed ${formatInr(opts.offeredBudget)}${
        opts.previousBudget != null && opts.previousBudget !== opts.offeredBudget
          ? ` (was ${formatInr(opts.previousBudget)})`
          : ""
      }.`,
    },
    CONFIRM: {
      title: "Deal confirmed",
      line: `You confirmed the deal with ${opts.creatorName} (${handle}) at ${formatInr(opts.offeredBudget)}.`,
    },
    MARK_DELIVERED: {
      title: "Content delivered",
      line: `${opts.creatorName} (${handle}) marked the content as delivered.`,
    },
    MARK_COMPLETED: {
      title: "Deal completed",
      line: `Deal with ${opts.creatorName} (${handle}) is marked completed.`,
    },
    CANCEL: {
      title: "Deal cancelled",
      line: `Deal with ${opts.creatorName} (${handle}) was cancelled.`,
    },
  };

  const copy = actionCopy[opts.action];

  const text = layoutText(
    copy.title,
    [
      copy.line,
      opts.note ? `\nNote: "${opts.note}"` : null,
      "",
      `Status: ${statusLabel(opts.newStatus)}`,
      `Amount: ${formatInr(opts.offeredBudget)}`,
      "",
      "Open the deal thread to reply or take the next step.",
    ],
    url
  );

  return {
    subject: `${copy.title} — ${handle}`,
    text,
  };
}

export function statusChangeEmailForCreator(opts: {
  inquiryId: string;
  brandName: string;
  action: InquiryAction;
  previousStatus: InquiryStatus;
  newStatus: InquiryStatus;
  offeredBudget: number;
  previousBudget?: number;
  note?: string;
}): { subject: string; text: string } {
  const url = inquiryUrl(opts.inquiryId);

  const actionCopy: Record<InquiryAction, { title: string; line: string }> = {
    ACCEPT: {
      title: "You accepted the deal",
      line: `You accepted the deal with ${opts.brandName} at ${formatInr(opts.offeredBudget)}.`,
    },
    DECLINE: {
      title: "You declined the deal",
      line: `You declined the deal with ${opts.brandName}.`,
    },
    COUNTER: {
      title: "Brand sent a counter offer",
      line: `${opts.brandName} proposed ${formatInr(opts.offeredBudget)}${
        opts.previousBudget != null && opts.previousBudget !== opts.offeredBudget
          ? ` (was ${formatInr(opts.previousBudget)})`
          : ""
      }.`,
    },
    CONFIRM: {
      title: "Brand confirmed the deal",
      line: `${opts.brandName} confirmed the deal at ${formatInr(opts.offeredBudget)}.`,
    },
    MARK_DELIVERED: {
      title: "Delivery recorded",
      line: `You marked content as delivered for ${opts.brandName}.`,
    },
    MARK_COMPLETED: {
      title: "Deal completed",
      line: `${opts.brandName} marked the deal as completed.`,
    },
    CANCEL: {
      title: "Deal cancelled",
      line: `${opts.brandName} cancelled the deal.`,
    },
  };

  const copy = actionCopy[opts.action];

  const text = layoutText(
    copy.title,
    [
      copy.line,
      opts.note ? `\nNote: "${opts.note}"` : null,
      "",
      `Status: ${statusLabel(opts.newStatus)}`,
      `Amount: ${formatInr(opts.offeredBudget)}`,
      "",
      "Open the deal thread to respond.",
    ],
    url
  );

  return {
    subject: `${copy.title} — ${opts.brandName}`,
    text,
  };
}
