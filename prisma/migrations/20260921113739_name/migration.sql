/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `rider_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rider_profiles" DROP COLUMN "approvedAt",
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT;
