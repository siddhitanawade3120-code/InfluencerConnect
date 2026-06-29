import { MongoClient, ObjectId, type Db, type Document } from "mongodb";
import type { Creator } from "./types";
import { parseJsonArray } from "./creator-mapper";

function getUri(): string {
  let uri = (process.env.DATABASE_URL ?? process.env.MONGODB_URI)?.trim();
  if (!uri) {
    throw new Error(
      "DATABASE_URL is not set. In Netlify: Site configuration → Environment variables → add DATABASE_URL, scope All, then redeploy."
    );
  }
  uri = uri.replace(/^["']|["']$/g, "");
  return uri;
}

export function hasDatabaseUrl(): boolean {
  return Boolean(
    process.env.DATABASE_URL?.trim() || process.env.MONGODB_URI?.trim()
  );
}

/** Open connection, run query, close — works reliably on Netlify serverless */
export async function withMongo<T>(fn: (db: Db) => Promise<T>): Promise<T> {
  const client = new MongoClient(getUri(), {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 15000,
    maxPoolSize: 1,
  });
  try {
    await client.connect();
    return await fn(client.db("influconnect"));
  } finally {
    await client.close().catch(() => undefined);
  }
}

/** @deprecated Prefer withMongo in API routes */
export async function getDb(): Promise<Db> {
  throw new Error("Use withMongo() instead of getDb() on serverless");
}

export interface CreatorDocument extends Document {
  _id: ObjectId;
  instagramHandle: string;
  fullName: string;
  city: string;
  area: string;
  nicheTags: string;
  followerCount: number;
  avgEngagementRate: number;
  estimatedRateMin: number;
  estimatedRateMax: number;
  contactMethod: string;
  contactValue: string;
  lastVerifiedDate: Date;
  profilePicUrl: string;
  accountType: string;
  isVerifiedActive: boolean;
  recentPostCountChecked?: number | null;
  avgLikes?: number | null;
  avgComments?: number | null;
  contentStyle?: string | null;
  previousBrandCollabs?: string | null;
  language?: string | null;
  sourceFound?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export function docToCreator(doc: CreatorDocument): Creator {
  return {
    id: doc._id.toString(),
    instagramHandle: doc.instagramHandle,
    fullName: doc.fullName,
    city: doc.city,
    area: doc.area,
    nicheTags: parseJsonArray(doc.nicheTags),
    followerCount: doc.followerCount,
    avgEngagementRate: doc.avgEngagementRate,
    estimatedRateMin: doc.estimatedRateMin,
    estimatedRateMax: doc.estimatedRateMax,
    contactMethod: doc.contactMethod,
    contactValue: doc.contactValue,
    lastVerifiedDate: doc.lastVerifiedDate.toISOString().split("T")[0],
    profilePicUrl: doc.profilePicUrl,
    accountType: doc.accountType,
    isVerifiedActive: doc.isVerifiedActive,
    recentPostCountChecked: doc.recentPostCountChecked ?? undefined,
    avgLikes: doc.avgLikes ?? undefined,
    avgComments: doc.avgComments ?? undefined,
    contentStyle: doc.contentStyle ?? undefined,
    previousBrandCollabs: doc.previousBrandCollabs ?? undefined,
    language: parseJsonArray<string>(doc.language),
    sourceFound: doc.sourceFound ?? undefined,
    notes: doc.notes ?? undefined,
  };
}

export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

export { ObjectId };
