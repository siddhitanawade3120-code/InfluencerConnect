import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertInquiryParticipant,
  InquiryAccessError,
} from "@/lib/inquiry-access";
import { serializeMessage } from "@/lib/inquiry-serializer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id: inquiryId } = await params;
  const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
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

  const messages = await prisma.message.findMany({
    where: { inquiryId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    messages: messages.map(serializeMessage),
  });
}

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id: inquiryId } = await params;
  const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    assertInquiryParticipant(user, inquiry);

    const body = await request.json();
    const text = String(body.body ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        inquiryId,
        senderRole: user.role,
        senderId: user.id,
        body: text,
      },
    });

    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(serializeMessage(message), { status: 201 });
  } catch (err) {
    if (err instanceof InquiryAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/inquiries/[id]/messages:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
