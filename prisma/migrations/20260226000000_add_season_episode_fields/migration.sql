-- AlterTable Season: add name, slug, description, heroImageUrl, score
ALTER TABLE "Season" ADD COLUMN "name" TEXT;
ALTER TABLE "Season" ADD COLUMN "slug" TEXT;
ALTER TABLE "Season" ADD COLUMN "description" TEXT;
ALTER TABLE "Season" ADD COLUMN "heroImageUrl" TEXT;
ALTER TABLE "Season" ADD COLUMN "score" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable Episode: add slug, description, heroImageUrl, score, seriesId
ALTER TABLE "Episode" ADD COLUMN "slug" TEXT;
ALTER TABLE "Episode" ADD COLUMN "description" TEXT;
ALTER TABLE "Episode" ADD COLUMN "heroImageUrl" TEXT;
ALTER TABLE "Episode" ADD COLUMN "score" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Episode" ADD COLUMN "seriesId" TEXT;

-- Backfill seriesId from the parent season (handles any existing rows)
UPDATE "Episode" e
SET "seriesId" = s."seriesId"
FROM "Season" s
WHERE e."seasonId" = s."id";

-- CreateIndex
CREATE UNIQUE INDEX "Season_slug_key" ON "Season"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_slug_key" ON "Episode"("slug");

-- CreateIndex
CREATE INDEX "Episode_seriesId_idx" ON "Episode"("seriesId");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
