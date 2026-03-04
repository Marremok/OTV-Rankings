-- AlterTable Season: add pillarScores JSON field
ALTER TABLE "Season" ADD COLUMN "pillarScores" JSONB;

-- AlterTable Episode: add pillarScores JSON field
ALTER TABLE "Episode" ADD COLUMN "pillarScores" JSONB;

-- CreateTable SeasonRatingPillar
CREATE TABLE "SeasonRatingPillar" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "pillarId" TEXT NOT NULL,

    CONSTRAINT "SeasonRatingPillar_pkey" PRIMARY KEY ("id")
);

-- CreateTable EpisodeRatingPillar
CREATE TABLE "EpisodeRatingPillar" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "pillarId" TEXT NOT NULL,

    CONSTRAINT "EpisodeRatingPillar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeasonRatingPillar_userId_seasonId_pillarId_key" ON "SeasonRatingPillar"("userId", "seasonId", "pillarId");

-- CreateIndex
CREATE INDEX "SeasonRatingPillar_userId_idx" ON "SeasonRatingPillar"("userId");

-- CreateIndex
CREATE INDEX "SeasonRatingPillar_seasonId_idx" ON "SeasonRatingPillar"("seasonId");

-- CreateIndex
CREATE INDEX "SeasonRatingPillar_pillarId_idx" ON "SeasonRatingPillar"("pillarId");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeRatingPillar_userId_episodeId_pillarId_key" ON "EpisodeRatingPillar"("userId", "episodeId", "pillarId");

-- CreateIndex
CREATE INDEX "EpisodeRatingPillar_userId_idx" ON "EpisodeRatingPillar"("userId");

-- CreateIndex
CREATE INDEX "EpisodeRatingPillar_episodeId_idx" ON "EpisodeRatingPillar"("episodeId");

-- CreateIndex
CREATE INDEX "EpisodeRatingPillar_pillarId_idx" ON "EpisodeRatingPillar"("pillarId");

-- AddForeignKey
ALTER TABLE "SeasonRatingPillar" ADD CONSTRAINT "SeasonRatingPillar_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonRatingPillar" ADD CONSTRAINT "SeasonRatingPillar_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "Pillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonRatingPillar" ADD CONSTRAINT "SeasonRatingPillar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeRatingPillar" ADD CONSTRAINT "EpisodeRatingPillar_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeRatingPillar" ADD CONSTRAINT "EpisodeRatingPillar_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "Pillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeRatingPillar" ADD CONSTRAINT "EpisodeRatingPillar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
