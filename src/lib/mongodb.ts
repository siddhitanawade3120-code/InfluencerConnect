import { MongoClient, ObjectId, type Document } from "mongodb";
import type { Creator } from "./types";
import { parseJsonArray } from "./creator-mapper";

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | null;
  mongoConnectPromise: Promise<MongoClient> | null;
};

function getUri(): string {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is not set");
  return uri;
}

async function getClient(): Promise<MongoClient> {
  if (globalForMongo.mongoClient) return globalForMongo.mongoClient;

  if (!globalForMongo.mongoConnectPromise) {
    const client = new MongoClient(getUri(), {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
      family: 4,
    });
    globalForMongo.mongoConnectPromise = client.connect().then((connected) => {
      globalForMongo.mongoClient = connected;
      return connected;
    });
  }

  return globalForMongo.mongoConnectPromise;
}

export async function getDb() {
  const client = await getClient();
  return client.db("influconnect");
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
