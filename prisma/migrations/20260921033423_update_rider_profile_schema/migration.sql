/*
  Warnings:

  - A unique constraint covering the columns `[licenseNumber]` on the table `rider_profiles` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `vehicleType` on the `rider_profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BIKE', 'MOTORCYCLE');

-- AlterEnum
ALTER TYPE "RiderStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "rider_profiles" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
DROP COLUMN "vehicleType",
ADD COLUMN     "vehicleType" "VehicleType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "rider_profiles_licenseNumber_key" ON "rider_profiles"("licenseNumber");
