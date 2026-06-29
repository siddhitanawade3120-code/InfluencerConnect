import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashPassword,
  normalizeEmail,
  normalizeInstagramHandle,
  sessionCookieOptions,
} from "@/lib/auth";
import { ensureCreatorFromInstagram } from "@/lib/creator-import";
import { invalidateRegisteredCreatorCache } from "@/lib/creator-registry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email ?? "");
    const password = (body.password ?? "").toString();
    const name = (body.name ?? "").toString().trim();
    const phone = (body.phone ?? "").toString().trim() || null;
    const instagramHandle = normalizeInstagramHandle(body.instagramHandle ?? "");
    const bio = (body.bio ?? "").toString().trim() || null;
    const city = (body.city ?? "Mumbai").toString().trim();
    const area = (body.area ?? "Vasai-Virar").toString().trim();

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Email and password (min 8 characters) are required" },
        { status: 400 }
      );
    }
    if (!name || !instagramHandle) {
      return NextResponse.json(
        { error: "Name and Instagram handle are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const handleTaken = await prisma.creatorProfile.findUnique({
      where: { instagramHandle },
    });
    if (handleTaken) {
      return NextResponse.json(
        { error: "This Instagram handle is already registered to another account" },
        { status: 409 }
      );
    }

    // Scrape Instagram and add/update public directory profile for brands
    const imported = await ensureCreatorFromInstagram(instagramHandle, {
      city,
      area,
      sourceFound: "creator-signup",
    });

    if (!imported.ok) {
      return NextResponse.json({ error: imported.error }, { status: 400 });
    }

    const directoryCreator = imported.creator;
    invalidateRegisteredCreatorCache();

    const alreadyClaimed = await prisma.creatorProfile.findFirst({
      where: { creatorId: directoryCreator.id },
    });
    if (alreadyClaimed) {
      return NextResponse.json(
        {
          error:
            "This Instagram profile has already been claimed. Contact support if this is your account.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "CREATOR",
        name,
        phone,
        creatorProfile: {
          create: {
            instagramHandle,
            bio: bio ?? directoryCreator.notes ?? null,
            creatorId: directoryCreator.id,
          },
        },
      },
      include: { creatorProfile: true },
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
          creatorProfile: user.creatorProfile,
          claimedCreator: true,
          directoryProfile: {
            followerCount: directoryCreator.followerCount,
            avgEngagementRate: directoryCreator.avgEngagementRate,
            profilePicUrl: directoryCreator.profilePicUrl,
          },
        },
        redirect: "/dashboard/creator",
      },
      { status: 201 }
    );
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (err) {
    console.error("POST /api/auth/signup/creator:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
