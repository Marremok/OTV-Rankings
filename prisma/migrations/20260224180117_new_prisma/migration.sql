/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Character` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type,mediaType]` on the table `Pillar` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Pillar_type_key";

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "actorName" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "pillarScores" JSONB,
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Series" ADD COLUMN     "pillarScores" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "profileImage" TEXT;

-- CreateTable
CREATE TABLE "UserFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaType" "mediaType" NOT NULL,
    "mediaId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSeriesStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "isWatchlist" BOOLEAN NOT NULL DEFAULT false,
    "isSeen" BOOLEAN NOT NULL DEFAULT false,
    "isWatching" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSeriesStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterRatingPillar" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "pillarId" TEXT NOT NULL,

    CONSTRAINT "CharacterRatingPillar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFavorite_userId_mediaType_idx" ON "UserFavorite"("userId", "mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorite_userId_mediaType_mediaId_key" ON "UserFavorite"("userId", "mediaType", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorite_userId_mediaType_rank_key" ON "UserFavorite"("userId", "mediaType", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_stripeSessionId_key" ON "Donation"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Donation_email_idx" ON "Donation"("email");

-- CreateIndex
CREATE INDEX "Donation_userId_idx" ON "Donation"("userId");

-- CreateIndex
CREATE INDEX "Donation_createdAt_idx" ON "Donation"("createdAt");

-- CreateIndex
CREATE INDEX "UserSeriesStatus_userId_idx" ON "UserSeriesStatus"("userId");

-- CreateIndex
CREATE INDEX "UserSeriesStatus_seriesId_idx" ON "UserSeriesStatus"("seriesId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSeriesStatus_userId_seriesId_key" ON "UserSeriesStatus"("userId", "seriesId");

-- CreateIndex
CREATE INDEX "CharacterRatingPillar_userId_idx" ON "CharacterRatingPillar"("userId");

-- CreateIndex
CREATE INDEX "CharacterRatingPillar_characterId_idx" ON "CharacterRatingPillar"("characterId");

-- CreateIndex
CREATE INDEX "CharacterRatingPillar_pillarId_idx" ON "CharacterRatingPillar"("pillarId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterRatingPillar_userId_characterId_pillarId_key" ON "CharacterRatingPillar"("userId", "characterId", "pillarId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_slug_key" ON "Character"("slug");

-- CreateIndex
CREATE INDEX "Character_name_idx" ON "Character"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pillar_type_mediaType_key" ON "Pillar"("type", "mediaType");

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSeriesStatus" ADD CONSTRAINT "UserSeriesStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSeriesStatus" ADD CONSTRAINT "UserSeriesStatus_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRatingPillar" ADD CONSTRAINT "CharacterRatingPillar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRatingPillar" ADD CONSTRAINT "CharacterRatingPillar_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRatingPillar" ADD CONSTRAINT "CharacterRatingPillar_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "Pillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
