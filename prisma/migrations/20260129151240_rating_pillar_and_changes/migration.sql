/*
  Warnings:

  - You are about to drop the column `score` on the `Pillar` table. All the data in the column will be lost.
  - You are about to drop the column `seriesId` on the `Pillar` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Pillar` table. All the data in the column will be lost.
  - Added the required column `media` to the `Pillar` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "mediaType" AS ENUM ('SERIES', 'CHARACTER', 'EPISODE', 'SEASON');

-- DropForeignKey
ALTER TABLE "Pillar" DROP CONSTRAINT "Pillar_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "Pillar" DROP CONSTRAINT "Pillar_userId_fkey";

-- AlterTable
ALTER TABLE "Pillar" DROP COLUMN "score",
DROP COLUMN "seriesId",
DROP COLUMN "userId",
ADD COLUMN     "media" "mediaType" NOT NULL;

-- CreateTable
CREATE TABLE "RatingPillar" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,

    CONSTRAINT "RatingPillar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RatingPillar" ADD CONSTRAINT "RatingPillar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingPillar" ADD CONSTRAINT "RatingPillar_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
