-- AlterTable
ALTER TABLE "rider_profiles" ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sespendedAt" TIMESTAMP(3);
