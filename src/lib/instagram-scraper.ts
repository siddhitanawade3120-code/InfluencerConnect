import https from "https";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface ScrapedPost {
  likes: number;
  comments: number;
}

export interface ScrapedProfile {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  profilePicUrl: string;
  followers: number;
  following: number;
  postCount: number;
  verified: boolean;
  isPrivate: boolean;
  website?: string;
  accountType: "Personal" | "Creator" | "Business";
  lastPosts: ScrapedPost[];
}

export interface ScrapeResult {
  profile: ScrapedProfile;
  avgLikes: number;
  avgComments: number;
  avgEngagementRate: number;
  postsChecked: number;
  nicheTags: string[];
  estimatedRateMin: number;
  estimatedRateMax: number;
  contentStyle: string;
}

const IG_APP_ID = "936619743392459";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function getSessionId(): string | undefined {
  const raw = process.env.INSTAGRAM_SESSION_ID?.trim();
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function igHeaders(sessionId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    "X-IG-App-ID": IG_APP_ID,
    "X-Requested-With": "XMLHttpRequest",
    Accept: "*/*",
    Referer: "https://www.instagram.com/",
  };
  if (sessionId) {
    headers.Cookie = `sessionid=${sessionId}`;
  }
  return headers;
}

interface IgUserNode {
  id: string;
  username: string;
  full_name: string;
  biography: string;
  profile_pic_url_hd?: string;
  profile_pic_url?: string;
  edge_followed_by: { count: number };
  edge_follow: { count: number };
  edge_owner_to_timeline_media: {
    count: number;
    edges: {
      node: {
        edge_liked_by?: { count: number };
        edge_media_preview_like?: { count: number };
        edge_media_to_comment?: { count: number };
      };
    }[];
  };
  is_private: boolean;
  is_verified: boolean;
  is_business_account?: boolean;
  business_category_name?: string;
  external_url?: string;
}

function httpsGet(
  url: string,
  headers: Record<string, string>
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers, timeout: 12000, family: 4 }, (res) => {
      let body = "";
      res.on("data", (chunk: string) => {
        body += chunk;
      });
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Instagram request timed out after 12s"));
    });
  });
}

async function curlGet(url: string, headers: Record<string, string>): Promise<{ status: number; body: string }> {
  const curlBin = process.platform === "win32" ? "curl.exe" : "curl";
  const args = [
    "-s",
    "-w",
    "\n__CURL_STATUS__:%{http_code}",
    "--max-time",
    "15",
    ...Object.entries(headers).flatMap(([k, v]) => ["-H", `${k}: ${v}`]),
    url,
  ];
  const { stdout } = await execFileAsync(curlBin, args, { maxBuffer: 15 * 1024 * 1024 });
  const marker = stdout.lastIndexOf("\n__CURL_STATUS__:");
  if (marker === -1) return { status: 200, body: stdout };
  const body = stdout.slice(0, marker);
  const status = parseInt(stdout.slice(marker + 17), 10);
  return { status, body };
}

async function httpGet(url: string, headers: Record<string, string>): Promise<{ status: number; body: string }> {
  try {
    const viaHttps = await httpsGet(url, headers);
    if (viaHttps.status === 200) return viaHttps;
    // Node TLS often gets 429 from Instagram — curl works on same machine
    if (viaHttps.status === 429 || viaHttps.status === 403) {
      return curlGet(url, headers);
    }
    return viaHttps;
  } catch {
    return curlGet(url, headers);
  }
}

async function fetchViaWebApi(username: string): Promise<IgUserNode> {
  const sessionId = getSessionId();
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;

  const attempts: (string | undefined)[] = [undefined];
  if (sessionId) attempts.push(sessionId);

  let lastStatus = 0;
  let lastBody = "";

  for (const sid of attempts) {
    try {
      const { status, body } = await httpGet(url, igHeaders(sid));
      lastStatus = status;
      lastBody = body;

      if (status === 429) continue;
      if (status === 401 || status === 403) continue;
      if (status === 404) throw new Error("Instagram profile not found. Check the username.");
      if (status < 200 || status >= 300) continue;

      const json = JSON.parse(body) as { data?: { user?: IgUserNode }; user?: IgUserNode };
      const user = json.data?.user ?? json.user;
      if (user) return user;
    } catch (err) {
      if (err instanceof Error && err.message.includes("not found")) throw err;
    }
  }

  if (lastStatus === 429) {
    throw new Error("Instagram rate-limited. Wait a few minutes and try again.");
  }
  if (lastStatus === 401 || lastStatus === 403) {
    throw new Error(
      "Instagram blocked the request. Remove or refresh INSTAGRAM_SESSION_ID in .env."
    );
  }
  throw new Error(`Instagram API error (${lastStatus}). ${lastBody.slice(0, 120)}`);
}

async function fetchViaLegacyScraper(username: string): Promise<IgUserNode | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Insta = require("scraper-instagram");
    const client = new Insta();
    const sessionId = getSessionId();
    if (sessionId) await client.authBySessionId(sessionId);
    const raw = await client.getProfile(username);
    return {
      id: raw.id,
      username,
      full_name: raw.name,
      biography: raw.bio ?? "",
      profile_pic_url_hd: raw.pic,
      edge_followed_by: { count: raw.followers },
      edge_follow: { count: raw.following },
      edge_owner_to_timeline_media: {
        count: raw.posts,
        edges: (raw.lastPosts ?? []).map(
          (p: { likes: number; comments: number }) => ({
            node: {
              edge_liked_by: { count: p.likes },
              edge_media_to_comment: { count: p.comments },
            },
          })
        ),
      },
      is_private: raw.private,
      is_verified: raw.verified,
      is_business_account: !!raw.business,
      business_category_name: raw.business,
      external_url: raw.website,
    };
  } catch {
    return null;
  }
}

function scrapeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const code = typeof err === "number" ? err : undefined;
  switch (code) {
    case 429:
      return "Instagram rate-limited. Wait and retry.";
    case 401:
      return "Instagram session expired. Update INSTAGRAM_SESSION_ID.";
    case 406:
      return "Instagram page format changed. Ensure INSTAGRAM_SESSION_ID is set in .env.";
    default:
      return `Instagram scrape failed (${String(err)}). Set INSTAGRAM_SESSION_ID in .env.`;
  }
}

function detectNiches(bio: string): string[] {
  const text = bio.toLowerCase();
  const niches: string[] = [];
  if (/food|foodie|eats|restaurant|kitchen|street food|cloud kitchen/.test(text))
    niches.push("Food");
  if (/dessert|sweet|bakery|cake|pastry/.test(text)) niches.push("Desserts");
  if (/cafe|coffee|brunch/.test(text)) niches.push("Cafe");
  if (/lifestyle|fashion|travel|vlog/.test(text)) niches.push("Lifestyle");
  if (niches.length === 0) niches.push("Food");
  return niches;
}

function estimateRate(followers: number): { min: number; max: number } {
  if (followers < 1000) return { min: 500, max: 800 };
  if (followers < 10000) return { min: 600, max: 1500 };
  if (followers < 50000) return { min: 1500, max: 4000 };
  if (followers < 200000) return { min: 4000, max: 9000 };
  return { min: 8000, max: 15000 };
}

function detectContentStyle(postCount: number, lastPosts: ScrapedPost[]): string {
  if (lastPosts.length === 0) return "Mix";
  return postCount > 50 ? "Reels-only" : "Mix";
}

function mapUserToResult(user: IgUserNode, handle: string): ScrapeResult {
  const lastPosts = user.edge_owner_to_timeline_media.edges.slice(0, 6).map((edge) => ({
    likes: edge.node.edge_liked_by?.count ?? edge.node.edge_media_preview_like?.count ?? 0,
    comments: edge.node.edge_media_to_comment?.count ?? 0,
  }));

  const postsChecked = lastPosts.length;
  const followers = user.edge_followed_by.count;
  const avgLikes =
    postsChecked > 0
      ? Math.round(lastPosts.reduce((s, p) => s + p.likes, 0) / postsChecked)
      : 0;
  const avgComments =
    postsChecked > 0
      ? Math.round(lastPosts.reduce((s, p) => s + p.comments, 0) / postsChecked)
      : 0;
  const avgEngagementRate =
    followers > 0 && postsChecked > 0
      ? Math.round(((avgLikes + avgComments) / followers) * 1000) / 10
      : 0;

  const rate = estimateRate(followers);
  let accountType: "Personal" | "Creator" | "Business" = "Personal";
  if (user.is_business_account || user.business_category_name) accountType = "Business";
  else if (user.is_verified) accountType = "Creator";

  const profile: ScrapedProfile = {
    id: user.id,
    username: handle,
    fullName: user.full_name || handle,
    bio: user.biography || "",
    profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || "",
    followers,
    following: user.edge_follow.count,
    postCount: user.edge_owner_to_timeline_media.count,
    verified: user.is_verified,
    isPrivate: user.is_private,
    website: user.external_url,
    accountType,
    lastPosts,
  };

  return {
    profile,
    avgLikes,
    avgComments,
    avgEngagementRate,
    postsChecked,
    nicheTags: detectNiches(profile.bio),
    estimatedRateMin: rate.min,
    estimatedRateMax: rate.max,
    contentStyle: detectContentStyle(profile.postCount, lastPosts),
  };
}

export async function scrapeInstagramProfile(username: string): Promise<ScrapeResult> {
  const handle = username.replace(/^@/, "").trim().toLowerCase();
  if (!handle) throw new Error("Instagram username is required");

  let user: IgUserNode | null = null;
  let lastError: unknown;

  try {
    user = await fetchViaWebApi(handle);
  } catch (err) {
    lastError = err;
  }

  if (!user) {
    user = await fetchViaLegacyScraper(handle);
  }

  if (!user) {
    throw new Error(scrapeErrorMessage(lastError));
  }

  if (user.is_private) {
    throw new Error(`@${handle} is private. Only public profiles can be imported.`);
  }

  return mapUserToResult(user, handle);
}

export function scrapedToCreatorInput(
  scraped: ScrapeResult,
  overrides: {
    city?: string;
    area?: string;
    nicheTags?: string[];
    estimatedRateMin?: number;
    estimatedRateMax?: number;
    notes?: string;
    sourceFound?: string;
  } = {}
) {
  const { profile } = scraped;
  const contactValue =
    profile.website?.includes("mailto:")
      ? profile.website.replace("mailto:", "")
      : profile.website || "DM only";

  return {
    instagramHandle: profile.username,
    fullName: profile.fullName,
    city: overrides.city ?? "Mumbai",
    area: overrides.area ?? "Vasai-Virar",
    nicheTags: overrides.nicheTags?.length ? overrides.nicheTags : scraped.nicheTags,
    followerCount: profile.followers,
    avgEngagementRate: scraped.avgEngagementRate,
    estimatedRateMin: overrides.estimatedRateMin ?? scraped.estimatedRateMin,
    estimatedRateMax: overrides.estimatedRateMax ?? scraped.estimatedRateMax,
    contactMethod: profile.website ? "email" : "dm_only",
    contactValue: profile.website ? contactValue : "DM only",
    lastVerifiedDate: new Date().toISOString().split("T")[0],
    profilePicUrl: profile.profilePicUrl,
    accountType: profile.accountType,
    isVerifiedActive: true,
    recentPostCountChecked: scraped.postsChecked || 6,
    avgLikes: scraped.avgLikes || null,
    avgComments: scraped.avgComments || null,
    contentStyle: scraped.contentStyle,
    previousBrandCollabs: null,
    language: ["Hindi", "English"],
    sourceFound: overrides.sourceFound ?? "instagram-api",
    notes:
      overrides.notes ??
      [profile.bio, profile.verified ? "Instagram verified" : ""].filter(Boolean).join(" · "),
  };
}
