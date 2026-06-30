import { inquiryUrl } from "@/lib/app-url";
import { statusLabel, type InquiryAction, type InquiryStatus } from "@/lib/inquiry-types";

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(title: string, bodyHtml: string, ctaLabel: string, ctaHref: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;color:#3d2c1e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #e8dfd3;overflow:hidden;">
        <tr><td style="background:#c45c3e;padding:20px 24px;">
          <p style="margin:0;font-size:18px;font-weight:bold;color:#ffffff;">InfluConnect</p>
          <p style="margin:4px 0 0;font-size:13px;color:#fde8e0;">Vasai-Virar creator marketplace</p>
        </td></tr>
        <tr><td style="padding:24px;">
          <h1 style="margin:0 0 16px;font-size:20px;color:#3d2c1e;">${escapeHtml(title)}</h1>
          ${bodyHtml}
          <p style="margin:24px 0 0;">
            <a href="${ctaHref}" style="display:inline-block;background:#c45c3e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:bold;">${escapeHtml(ctaLabel)}</a>
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#8a7a6a;">You received this because you have an account on InfluConnect.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#5c4a3a;">${text}</p>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#8a7a6a;width:120px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-size:14px;color:#3d2c1e;font-weight:bold;">${value}</td>
  </tr>`;
}

function detailsTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 16px;background:#faf7f2;border-radius:10px;padding:12px 16px;">${rows}</table>`;
}

export function newDealEmailForCreator(opts: {
  inquiryId: string;
  brandName: string;
  offeredBudget: number;
  deliverables: string;
  deadline: string | null;
}): { subject: string; html: string; text: string } {
  const url = inquiryUrl(opts.inquiryId);
  const deadlineRow = opts.deadline
    ? detailRow("Deadline", escapeHtml(opts.deadline))
    : "";

  const bodyHtml =
    paragraph(`<strong>${escapeHtml(opts.brandName)}</strong> sent you a new deal request on InfluConnect.`) +
    detailsTable(
      detailRow("Offer", formatInr(opts.offeredBudget)) +
        detailRow("Deliverables", escapeHtml(opts.deliverables)) +
        deadlineRow
    ) +
    paragraph("Log in to review, accept, decline, or counter the offer.");

  const text = [
    `${opts.brandName} sent you a new deal request.`,
    `Offer: ${formatInr(opts.offeredBudget)}`,
    `Deliverables: ${opts.deliverables}`,
    opts.deadline ? `Deadline: ${opts.deadline}` : null,
    `View deal: ${url}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `New deal from ${opts.brandName} — ${formatInr(opts.offeredBudget)}`,
    html: layout("New deal request", bodyHtml, "View deal", url),
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
}): { subject: string; html: string; text: string } {
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
  let bodyHtml = paragraph(copy.line);
  if (opts.note) {
    bodyHtml += paragraph(`<em>"${escapeHtml(opts.note)}"</em>`);
  }
  bodyHtml +=
    detailsTable(
      detailRow("Status", escapeHtml(statusLabel(opts.newStatus))) +
        detailRow("Amount", formatInr(opts.offeredBudget))
    ) + paragraph("Open the deal thread to reply or take the next step.");

  const text = [
    copy.line,
    opts.note ? `Note: ${opts.note}` : null,
    `Status: ${statusLabel(opts.newStatus)}`,
    `Amount: ${formatInr(opts.offeredBudget)}`,
    `View deal: ${url}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `${copy.title} — ${handle}`,
    html: layout(copy.title, bodyHtml, "View deal", url),
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
}): { subject: string; html: string; text: string } {
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
  let bodyHtml = paragraph(copy.line);
  if (opts.note) {
    bodyHtml += paragraph(`<em>"${escapeHtml(opts.note)}"</em>`);
  }
  bodyHtml +=
    detailsTable(
      detailRow("Status", escapeHtml(statusLabel(opts.newStatus))) +
        detailRow("Amount", formatInr(opts.offeredBudget))
    ) + paragraph("Open the deal thread to respond.");

  const text = [
    copy.line,
    opts.note ? `Note: ${opts.note}` : null,
    `Status: ${statusLabel(opts.newStatus)}`,
    `Amount: ${formatInr(opts.offeredBudget)}`,
    `View deal: ${url}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `${copy.title} — ${opts.brandName}`,
    html: layout(copy.title, bodyHtml, "View deal", url),
    text,
  };
}
