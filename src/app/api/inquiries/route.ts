import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enrichInquiry } from "@/lib/inquiry-serializer";
import { notifyNewInquiry } from "@/lib/inquiry-notifications";
import { isValidObjectId } from "@/lib/mongodb";
import { isRegisteredCreator } from "@/lib/creator-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  if (role === "brand") {
    if (user.role !== "BRAND") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rows = await prisma.inquiry.findMany({
      where: { brandId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    const creatorIds = [...new Set(rows.map((r) => r.creatorId))];
    const creators = await prisma.creator.findMany({
      where: { id: { in: creatorIds } },
    });
    const creatorMap = new Map(creators.map((c) => [c.id, c]));

    const counts = await prisma.message.groupBy({
      by: ["inquiryId"],
      where: { inquiryId: { in: rows.map((r) => r.id) } },
      _count: { _all: true },
    });
    const countMap = new Map(counts.map((c) => [c.inquiryId, c._count._all]));

    return NextResponse.json({
      inquiries: rows.map((row) =>
        enrichInquiry(row, {
          creator: creatorMap.get(row.creatorId) ?? null,
          messageCount: countMap.get(row.id) ?? 0,
        })
      ),
    });
  }

  if (role === "creator") {
    if (user.role !== "CREATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const creatorId = user.creatorProfile?.creatorId;
    if (!creatorId) {
      return NextResponse.json({ inquiries: [], unlinked: true });
    }

    const rows = await prisma.inquiry.findMany({
      where: { creatorId },
      orderBy: { updatedAt: "desc" },
    });

    const brandIds = [...new Set(rows.map((r) => r.brandId))];
    const brands = await prisma.user.findMany({
      where: { id: { in: brandIds } },
      include: { brandProfile: true },
    });
    const brandMap = new Map(brands.map((b) => [b.id, b]));

    const counts = await prisma.message.groupBy({
      by: ["inquiryId"],
      where: { inquiryId: { in: rows.map((r) => r.id) } },
      _count: { _all: true },
    });
    const countMap = new Map(counts.map((c) => [c.inquiryId, c._count._all]));

    return NextResponse.json({
      inquiries: rows.map((row) =>
        enrichInquiry(row, {
          brand: brandMap.get(row.brandId) ?? null,
          messageCount: countMap.get(row.id) ?? 0,
        })
      ),
    });
  }

  return NextResponse.json(
    { error: "Query param role=brand or role=creator is required" },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  if (user.role !== "BRAND" || !user.brandProfile) {
    return NextResponse.json({ error: "Only brands can send deal requests" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const creatorId = String(body.creatorId ?? "").trim();
    const deliverables = String(body.deliverables ?? "").trim();
    const offeredBudget = parseInt(String(body.offeredBudget ?? ""), 10);
    const deadlineRaw = body.deadline ? String(body.deadline) : null;

    if (!creatorId || !isValidObjectId(creatorId)) {
      return NextResponse.json({ error: "Valid creatorId is required" }, { status: 400 });
    }
    if (!deliverables) {
      return NextResponse.json({ error: "Deliverables are required" }, { status: 400 });
    }
    if (!Number.isFinite(offeredBudget) || offeredBudget <= 0) {
      return NextResponse.json({ error: "Valid offered budget is required" }, { status: 400 });
    }

    const { budgetMin, budgetMax } = user.brandProfile;
    if (offeredBudget < budgetMin || offeredBudget > budgetMax) {
      return NextResponse.json(
        {
          error: `Offer must be within your profile budget (₹${budgetMin.toLocaleString()}–₹${budgetMax.toLocaleString()})`,
        },
        { status: 400 }
      );
    }

    const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
    if (!creator || !creator.isVerifiedActive) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    if (!(await isRegisteredCreator(creatorId))) {
      return NextResponse.json(
        { error: "You can only send deals to creators registered on InfluConnect" },
        { status: 400 }
      );
    }

    let deadline: Date | null = null;
    if (deadlineRaw) {
      deadline = new Date(deadlineRaw);
      if (Number.isNaN(deadline.getTime())) {
        return NextResponse.json({ error: "Invalid deadline" }, { status: 400 });
      }
    }

    const existingPending = await prisma.inquiry.findFirst({
      where: {
        brandId: user.id,
        creatorId,
        status: { in: ["PENDING", "NEGOTIATING", "CONFIRMED", "DELIVERED"] },
      },
    });
    if (existingPending) {
      return NextResponse.json(
        { error: "You already have an active deal with this creator", inquiryId: existingPending.id },
        { status: 409 }
      );
    }

    const summary = [
      `Deal request: ₹${offeredBudget.toLocaleString("en-IN")}`,
      `Deliverables: ${deliverables}`,
      deadline ? `Deadline: ${deadline.toLocaleDateString("en-IN")}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const inquiry = await prisma.inquiry.create({
      data: {
        brandId: user.id,
        creatorId,
        offeredBudget,
        deliverables,
        deadline,
        status: "PENDING",
        messages: {
          create: {
            senderRole: "BRAND",
            senderId: user.id,
            body: summary,
          },
        },
      },
    });

    const emailNotify = await notifyNewInquiry({
      inquiryId: inquiry.id,
      brandId: user.id,
      creatorId,
      offeredBudget,
    });

    return NextResponse.json(
      {
        ...enrichInquiry(inquiry, {
          creator,
          brand: user,
          messageCount: 1,
        }),
        emailNotify,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/inquiries:", err);
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
