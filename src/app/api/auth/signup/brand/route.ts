import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashPassword,
  normalizeEmail,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email ?? "");
    const password = (body.password ?? "").toString();
    const name = (body.name ?? "").toString().trim();
    const phone = (body.phone ?? "").toString().trim() || null;
    const businessName = (body.businessName ?? "").toString().trim();
    const category = (body.category ?? "").toString().trim();
    const budgetMin = parseInt(String(body.budgetMin ?? ""), 10);
    const budgetMax = parseInt(String(body.budgetMax ?? ""), 10);
    const area = (body.area ?? "Vasai-Virar").toString().trim();
    const city = (body.city ?? "Mumbai").toString().trim();
    const website = (body.website ?? "").toString().trim() || null;
    const logoUrl = (body.logoUrl ?? "").toString().trim() || null;

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Email and password (min 8 characters) are required" },
        { status: 400 }
      );
    }
    if (!name || !businessName || !category) {
      return NextResponse.json(
        { error: "Name, business name, and category are required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(budgetMin) || !Number.isFinite(budgetMax) || budgetMin > budgetMax) {
      return NextResponse.json({ error: "Invalid budget range" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "BRAND",
        name,
        phone,
        brandProfile: {
          create: {
            businessName,
            category,
            budgetMin,
            budgetMax,
            area,
            city,
            website,
            logoUrl,
          },
        },
      },
      include: { brandProfile: true },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          brandProfile: user.brandProfile,
        },
        redirect: "/dashboard/brand",
      },
      { status: 201 }
    );
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (err) {
    console.error("POST /api/auth/signup/brand:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
