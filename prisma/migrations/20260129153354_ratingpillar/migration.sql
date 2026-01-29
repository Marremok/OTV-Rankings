/*
  Warnings:

  - You are about to drop the column `media` on the `Pillar` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,seriesId,pillarId]` on the table `RatingPillar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mediaType` to the `Pillar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pillarId` to the `RatingPillar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pillar" DROP COLUMN "media",
ADD COLUMN     "mediaType" "mediaType" NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "score",
ALTER COLUMN "weight" SET DEFAULT 1.0,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RatingPillar" ADD COLUMN     "pillarId" TEXT NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Question_pillarId_idx" ON "Question"("pillarId");

-- CreateIndex
CREATE INDEX "RatingPillar_userId_idx" ON "RatingPillar"("userId");

-- CreateIndex
CREATE INDEX "RatingPillar_seriesId_idx" ON "RatingPillar"("seriesId");

-- CreateIndex
CREATE INDEX "RatingPillar_pillarId_idx" ON "RatingPillar"("pillarId");

-- CreateIndex
CREATE UNIQUE INDEX "RatingPillar_userId_seriesId_pillarId_key" ON "RatingPillar"("userId", "seriesId", "pillarId");

-- AddForeignKey
ALTER TABLE "RatingPillar" ADD CONSTRAINT "RatingPillar_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "Pillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
