import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertInquiryParticipant,
  InquiryAccessError,
  parseInquiryAction,
  resolveStatusAfterAction,
} from "@/lib/inquiry-access";
import { enrichInquiry, serializeInquiry } from "@/lib/inquiry-serializer";
import { scheduleInquiryStatusEmail } from "@/lib/schedule-inquiry-email";
import { isInquiryStatus } from "@/lib/inquiry-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    assertInquiryParticipant(user, inquiry);
  } catch (err) {
    if (err instanceof InquiryAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const [brand, creator, messageCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: inquiry.brandId },
      include: { brandProfile: true },
    }),
    prisma.creator.findUnique({ where: { id: inquiry.creatorId } }),
    prisma.message.count({ where: { inquiryId: inquiry.id } }),
  ]);

  return NextResponse.json(
    enrichInquiry(inquiry, { brand, creator, messageCount })
  );
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    assertInquiryParticipant(user, inquiry);

    const body = await request.json();
    const action = parseInquiryAction(body.action);
    const currentStatus = isInquiryStatus(inquiry.status) ? inquiry.status : "PENDING";
    const nextStatus = resolveStatusAfterAction(action, currentStatus, user.role);

    const updateData: {
      status: string;
      offeredBudget?: number;
      deliverables?: string;
    } = { status: nextStatus };

    if (action === "COUNTER") {
      const offeredBudget = parseInt(String(body.offeredBudget ?? ""), 10);
      if (!Number.isFinite(offeredBudget) || offeredBudget <= 0) {
        return NextResponse.json({ error: "Valid counter budget is required" }, { status: 400 });
      }
      if (user.role === "BRAND" && user.brandProfile) {
        const { budgetMin, budgetMax } = user.brandProfile;
        if (offeredBudget < budgetMin || offeredBudget > budgetMax) {
          return NextResponse.json(
            { error: `Counter must be within your budget (₹${budgetMin}–₹${budgetMax})` },
            { status: 400 }
          );
        }
      }
      updateData.offeredBudget = offeredBudget;
      if (body.deliverables) {
        updateData.deliverables = String(body.deliverables).trim();
      }
    }

    const previousBudget = inquiry.offeredBudget;

    const autoBody =
      action !== "COUNTER"
        ? (
            {
              ACCEPT: "Creator accepted the deal.",
              DECLINE: "Creator declined the deal.",
              CONFIRM: "Brand confirmed the negotiated terms.",
              MARK_DELIVERED: "Creator marked content as delivered.",
              MARK_COMPLETED: "Brand marked the deal as completed.",
              CANCEL: "Brand cancelled the deal.",
            } as Partial<Record<typeof action, string>>
          )[action]
        : undefined;

    const messageBody =
      action === "COUNTER" && body.note
        ? String(body.note).trim()
        : autoBody;

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.inquiry.update({
        where: { id },
        data: updateData,
      });

      if (messageBody) {
        await tx.message.create({
          data: {
            inquiryId: id,
            senderRole: user.role,
            senderId: user.id,
            body: messageBody,
          },
        });
      }

      return row;
    });

    const counterNote = action === "COUNTER" && body.note ? String(body.note).trim() : undefined;

    scheduleInquiryStatusEmail({
      inquiryId: id,
      previousStatus: currentStatus,
      newStatus: nextStatus,
      brandId: inquiry.brandId,
      creatorId: inquiry.creatorId,
      actorRole: user.role,
      action,
      offeredBudget: updated.offeredBudget,
      previousBudget: action === "COUNTER" ? previousBudget : undefined,
      note: counterNote,
    });

    return NextResponse.json(serializeInquiry(updated));
  } catch (err) {
    if (err instanceof InquiryAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PATCH /api/inquiries/[id]:", err);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
