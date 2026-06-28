import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { scrapeInstagramProfile, scrapedToCreatorInput } from "@/lib/instagram-scraper";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const username = (body.username ?? body.instagramHandle ?? "").toString();

    const scraped = await scrapeInstagramProfile(username);
    const preview = scrapedToCreatorInput(scraped, {
      city: body.city,
      area: body.area,
      nicheTags: body.nicheTags,
      estimatedRateMin: body.estimatedRateMin,
      estimatedRateMax: body.estimatedRateMax,
    });

    return NextResponse.json({
      scraped: {
        username: scraped.profile.username,
        fullName: scraped.profile.fullName,
        followers: scraped.profile.followers,
        avgEngagementRate: scraped.avgEngagementRate,
        avgLikes: scraped.avgLikes,
        avgComments: scraped.avgComments,
        postsChecked: scraped.postsChecked,
        nicheTags: scraped.nicheTags,
        profilePicUrl: scraped.profile.profilePicUrl,
        bio: scraped.profile.bio,
        verified: scraped.profile.verified,
        accountType: scraped.profile.accountType,
      },
      preview,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
