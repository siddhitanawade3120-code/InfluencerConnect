-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instagramHandle" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "nicheTags" TEXT NOT NULL,
    "followerCount" INTEGER NOT NULL,
    "avgEngagementRate" REAL NOT NULL,
    "estimatedRateMin" INTEGER NOT NULL,
    "estimatedRateMax" INTEGER NOT NULL,
    "contactMethod" TEXT NOT NULL,
    "contactValue" TEXT NOT NULL,
    "lastVerifiedDate" DATETIME NOT NULL,
    "profilePicUrl" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "isVerifiedActive" BOOLEAN NOT NULL DEFAULT true,
    "recentPostCountChecked" INTEGER,
    "avgLikes" INTEGER,
    "avgComments" INTEGER,
    "contentStyle" TEXT,
    "previousBrandCollabs" TEXT,
    "language" TEXT,
    "sourceFound" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_instagramHandle_key" ON "Creator"("instagramHandle");
