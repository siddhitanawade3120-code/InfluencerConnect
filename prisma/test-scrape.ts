import { scrapeInstagramProfile } from "../src/lib/instagram-scraper";

const username = process.argv[2] ?? "foodie_khalasi24";

scrapeInstagramProfile(username)
  .then((r) => {
    console.log("OK:", r.profile.username, r.profile.followers, "followers", r.avgEngagementRate + "%");
  })
  .catch((e) => {
    console.error("FAIL:", e.message);
    process.exit(1);
  });
