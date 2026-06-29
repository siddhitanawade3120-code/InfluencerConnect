export type Niche = "Food" | "Desserts" | "Cafe" | "Lifestyle";

export type FollowerTier = "nano" | "micro" | "mid";

export type OutreachStatus = "not_sent" | "sent" | "replied" | "confirmed";

export type ContactMethod = "email" | "dm_only" | "whatsapp" | "phone";

export type AccountType = "Personal" | "Creator" | "Business";

export type ContentStyle = "Reels-only" | "Mix" | "Stories-heavy";

export interface Creator {
  id: string;
  instagramHandle: string;
  fullName: string;
  city: string;
  area: string;
  nicheTags: Niche[];
  followerCount: number;
  avgEngagementRate: number;
  estimatedRateMin: number;
  estimatedRateMax: number;
  contactMethod: ContactMethod | string;
  contactValue: string;
  lastVerifiedDate: string;
  profilePicUrl: string;
  accountType: AccountType | string;
  isVerifiedActive: boolean;
  recentPostCountChecked?: number;
  avgLikes?: number;
  avgComments?: number;
  contentStyle?: ContentStyle | string;
  previousBrandCollabs?: string;
  language?: string[];
  sourceFound?: string;
  notes?: string;
  /** Present when a logged-in brand session requests the list */
  matchScore?: number;
}

export interface SearchFilters {
  city: string;
  area: string;
  niches: Niche[];
  budgetMin: number;
  budgetMax: number;
  followerMin: number;
  followerMax: number;
  /** @deprecated UI presets only — API uses followerMin/Max */
  followerTiers: FollowerTier[];
}

export interface ShortlistItem {
  creatorId: string;
  status: OutreachStatus;
  addedAt: number;
}

export type SortOption = "match" | "engagement" | "followers" | "price_low";

export const CITIES = ["Mumbai"] as const;

/** Vasai-Virar hyperlocal localities for discovery filters */
export const VV_AREAS = [
  "Vasai-Virar",
  "Vasai",
  "Nalasopara",
  "Virar",
  "Naigaon",
  "Bhayandar",
] as const;

export const AREAS: Record<string, string[]> = {
  Mumbai: [...VV_AREAS, "All Mumbai"],
};

export const NICHES: Niche[] = ["Food", "Desserts", "Cafe", "Lifestyle"];

export const CONTACT_METHODS: { value: ContactMethod; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "dm_only", label: "DM only" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
];

export const ACCOUNT_TYPES: AccountType[] = ["Personal", "Creator", "Business"];

export const CONTENT_STYLES: ContentStyle[] = ["Reels-only", "Mix", "Stories-heavy"];

export const LANGUAGES = ["Hindi", "Marathi", "English"] as const;

export const FOLLOWER_TIERS: {
  id: FollowerTier;
  label: string;
  range: string;
  min: number;
  max: number;
}[] = [
  { id: "nano", label: "Nano", range: "1K–10K", min: 1000, max: 10000 },
  { id: "micro", label: "Micro", range: "10K–50K", min: 10000, max: 50000 },
  { id: "mid", label: "Mid", range: "50K–200K", min: 50000, max: 200000 },
];

export const DEFAULT_FILTERS: SearchFilters = {
  city: "Mumbai",
  area: "Vasai-Virar",
  niches: [],
  budgetMin: 500,
  budgetMax: 10000,
  followerMin: 0,
  followerMax: 500_000,
  followerTiers: [],
};

export function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function formatRate(min: number, max: number): string {
  const fmt = (n: number) =>
    n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`;
  return `${fmt(min)}–${fmt(max)}/post`;
}

export function getFollowerTier(followers: number): FollowerTier {
  if (followers < 10000) return "nano";
  if (followers < 50000) return "micro";
  return "mid";
}

export function isRecentlyVerified(dateStr: string, days = 30): boolean {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
}

export function filterCreators(
  creators: Creator[],
  filters: SearchFilters
): Creator[] {
  return creators.filter((c) => {
    if (!c.isVerifiedActive) return false;
    if (filters.city && c.city !== filters.city) return false;
    if (filters.area && filters.area !== "All Mumbai") {
      const vvAreas = [
        "Vasai",
        "Virar",
        "Vasai-Virar",
        "Nalasopara",
        "Naigaon",
        "Bhayandar",
      ];
      const areaMatch =
        c.area === filters.area ||
        (filters.area === "Vasai-Virar" && vvAreas.includes(c.area)) ||
        (vvAreas.includes(filters.area) && vvAreas.includes(c.area));
      if (!areaMatch) return false;
    }
    if (
      filters.niches.length > 0 &&
      !filters.niches.some((n) => c.nicheTags.includes(n))
    )
      return false;
    if (
      c.estimatedRateMax < filters.budgetMin ||
      c.estimatedRateMin > filters.budgetMax
    )
      return false;
    if (c.followerCount < filters.followerMin || c.followerCount > filters.followerMax)
      return false;
    return true;
  });
}

export function sortCreators(
  creators: Creator[],
  sort: SortOption
): Creator[] {
  const sorted = [...creators];
  switch (sort) {
    case "match":
      return sorted.sort(
        (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)
      );
    case "engagement":
      return sorted.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
    case "followers":
      return sorted.sort((a, b) => b.followerCount - a.followerCount);
    case "price_low":
      return sorted.sort((a, b) => a.estimatedRateMin - b.estimatedRateMin);
    default:
      return sorted;
  }
}

export function generateOutreachMessage(
  creator: Creator,
  businessName = "your cloud kitchen"
): string {
  const nicheText =
    creator.nicheTags.length > 0 ? creator.nicheTags[0].toLowerCase() : "food";
  return `Hi @${creator.instagramHandle}! 👋

I'm reaching out from ${businessName} in ${creator.area}. We've been following your ${nicheText} content and love your authentic style!

We're a small local business looking to collaborate with creators who genuinely connect with the Vasai-Virar community. Our budget is around ${creator.estimatedRateMin}–${creator.estimatedRateMax} per reel/post.

Would you be open to a quick chat about a possible collaboration? We'd love to invite you to try our menu and create something together.

Looking forward to hearing from you!

Best,
[Your Name]
[Your Business]`;
}
