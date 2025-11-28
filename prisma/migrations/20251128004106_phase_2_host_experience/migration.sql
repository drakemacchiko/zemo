/*
  Warnings:

  - A unique constraint covering the columns `[vin]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SignatureType" AS ENUM ('DRAW', 'UPLOAD', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('ECONOMY', 'COMPACT', 'MIDSIZE', 'FULL_SIZE', 'SUV', 'LUXURY', 'SPORTS', 'VAN', 'TRUCK', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "FuelPolicy" AS ENUM ('SAME_AS_PICKUP', 'PREPAID_FULL_TANK', 'PAY_FOR_USE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('PER_DAY', 'FLAT_FEE', 'PER_KM');

-- CreateEnum
CREATE TYPE "ConditionRating" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PhotoType" ADD VALUE 'TRUNK';
ALTER TYPE "PhotoType" ADD VALUE 'WHEELS';
ALTER TYPE "PhotoType" ADD VALUE 'DAMAGE';

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "additionalDriverFee" DOUBLE PRECISION,
ADD COLUMN     "advanceNoticeHours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "airportDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "airportDeliveryFee" DOUBLE PRECISION,
ADD COLUMN     "alwaysAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "cleaningFee" DOUBLE PRECISION,
ADD COLUMN     "customRules" TEXT,
ADD COLUMN     "deliveryAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deliveryFeePerKm" DOUBLE PRECISION,
ADD COLUMN     "deliveryRadius" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "extraMileageFee" DOUBLE PRECISION,
ADD COLUMN     "fuelPolicy" "FuelPolicy",
ADD COLUMN     "hideExactLocation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "instantBooking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insuranceCoverage" TEXT,
ADD COLUMN     "insurancePolicyNumber" TEXT,
ADD COLUMN     "lateReturnFee" DOUBLE PRECISION,
ADD COLUMN     "listingStatus" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "locationCity" TEXT,
ADD COLUMN     "locationPostalCode" TEXT,
ADD COLUMN     "locationProvince" TEXT,
ADD COLUMN     "longestTripDuration" INTEGER,
ADD COLUMN     "mileageAllowance" INTEGER,
ADD COLUMN     "minDriverAge" INTEGER NOT NULL DEFAULT 21,
ADD COLUMN     "minDrivingExperience" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "minRenterRating" DOUBLE PRECISION,
ADD COLUMN     "minRenterTrips" INTEGER,
ADD COLUMN     "monthlyDiscount" DOUBLE PRECISION,
ADD COLUMN     "monthlyEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfDoors" INTEGER,
ADD COLUMN     "petFee" DOUBLE PRECISION,
ADD COLUMN     "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pickupInstructions" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "requireVerifiedLicense" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shortestTripDuration" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "smokingAllowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smokingFee" DOUBLE PRECISION,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "totalTrips" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trim" TEXT,
ADD COLUMN     "usageRestrictions" JSONB,
ADD COLUMN     "vehicleCategory" "VehicleCategory",
ADD COLUMN     "vin" TEXT,
ADD COLUMN     "weekendPricing" DOUBLE PRECISION,
ADD COLUMN     "weeklyDiscount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "vehicle_document_signatures" (
    "id" TEXT NOT NULL,
    "vehicleDocumentId" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
    "signerRole" "UserRole" NOT NULL,
    "signatureType" "SignatureType" NOT NULL,
    "externalProvider" TEXT,
    "externalId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "auditData" JSONB,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_document_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_extras" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceType" "PriceType" NOT NULL DEFAULT 'PER_DAY',
    "price" DOUBLE PRECISION NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_extras" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "vehicleExtraId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_agreements" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "agreementTemplate" TEXT NOT NULL,
    "agreementContent" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "hostSigned" BOOLEAN NOT NULL DEFAULT false,
    "hostSignedAt" TIMESTAMP(3),
    "hostSignature" TEXT,
    "hostIpAddress" TEXT,
    "renterSigned" BOOLEAN NOT NULL DEFAULT false,
    "renterSignedAt" TIMESTAMP(3),
    "renterSignature" TEXT,
    "renterIpAddress" TEXT,
    "fullyExecuted" BOOLEAN NOT NULL DEFAULT false,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_inspections" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "inspectionType" "InspectionType" NOT NULL,
    "frontBumper" "ConditionRating" NOT NULL,
    "rearBumper" "ConditionRating" NOT NULL,
    "hood" "ConditionRating" NOT NULL,
    "roof" "ConditionRating" NOT NULL,
    "leftDoor" "ConditionRating" NOT NULL,
    "rightDoor" "ConditionRating" NOT NULL,
    "windows" "ConditionRating" NOT NULL,
    "lights" "ConditionRating" NOT NULL,
    "mirrors" "ConditionRating" NOT NULL,
    "tires" "ConditionRating" NOT NULL,
    "seats" "ConditionRating" NOT NULL,
    "dashboard" "ConditionRating" NOT NULL,
    "steeringWheel" "ConditionRating" NOT NULL,
    "floorMats" "ConditionRating" NOT NULL,
    "trunk" "ConditionRating" NOT NULL,
    "airConditioning" BOOLEAN NOT NULL,
    "allLights" BOOLEAN NOT NULL,
    "wipers" BOOLEAN NOT NULL,
    "horn" BOOLEAN NOT NULL,
    "locks" BOOLEAN NOT NULL,
    "fuelLevel" INTEGER NOT NULL,
    "fuelPhotoUrl" TEXT,
    "odometerReading" INTEGER NOT NULL,
    "odometerPhotoUrl" TEXT,
    "cleanliness" INTEGER NOT NULL,
    "photos" JSONB,
    "notes" TEXT,
    "damageReported" BOOLEAN NOT NULL DEFAULT false,
    "damagePhotos" JSONB,
    "damageDescription" TEXT,
    "estimatedCost" DOUBLE PRECISION,
    "hostSigned" BOOLEAN NOT NULL DEFAULT false,
    "hostSignedAt" TIMESTAMP(3),
    "renterSigned" BOOLEAN NOT NULL DEFAULT false,
    "renterSignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicle_document_signatures_vehicleDocumentId_idx" ON "vehicle_document_signatures"("vehicleDocumentId");

-- CreateIndex
CREATE INDEX "vehicle_document_signatures_signerId_idx" ON "vehicle_document_signatures"("signerId");

-- CreateIndex
CREATE INDEX "vehicle_extras_vehicleId_idx" ON "vehicle_extras"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_extras_available_idx" ON "vehicle_extras"("available");

-- CreateIndex
CREATE INDEX "booking_extras_bookingId_idx" ON "booking_extras"("bookingId");

-- CreateIndex
CREATE INDEX "booking_extras_vehicleExtraId_idx" ON "booking_extras"("vehicleExtraId");

-- CreateIndex
CREATE UNIQUE INDEX "rental_agreements_bookingId_key" ON "rental_agreements"("bookingId");

-- CreateIndex
CREATE INDEX "rental_agreements_bookingId_idx" ON "rental_agreements"("bookingId");

-- CreateIndex
CREATE INDEX "rental_agreements_vehicleId_idx" ON "rental_agreements"("vehicleId");

-- CreateIndex
CREATE INDEX "rental_agreements_hostId_idx" ON "rental_agreements"("hostId");

-- CreateIndex
CREATE INDEX "rental_agreements_renterId_idx" ON "rental_agreements"("renterId");

-- CreateIndex
CREATE INDEX "rental_agreements_fullyExecuted_idx" ON "rental_agreements"("fullyExecuted");

-- CreateIndex
CREATE INDEX "trip_inspections_agreementId_idx" ON "trip_inspections"("agreementId");

-- CreateIndex
CREATE INDEX "trip_inspections_inspectionType_idx" ON "trip_inspections"("inspectionType");

-- CreateIndex
CREATE UNIQUE INDEX "trip_inspections_agreementId_inspectionType_key" ON "trip_inspections"("agreementId", "inspectionType");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- CreateIndex
CREATE INDEX "vehicles_vehicleCategory_idx" ON "vehicles"("vehicleCategory");

-- CreateIndex
CREATE INDEX "vehicles_listingStatus_idx" ON "vehicles"("listingStatus");

-- AddForeignKey
ALTER TABLE "vehicle_document_signatures" ADD CONSTRAINT "vehicle_document_signatures_vehicleDocumentId_fkey" FOREIGN KEY ("vehicleDocumentId") REFERENCES "vehicle_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_document_signatures" ADD CONSTRAINT "vehicle_document_signatures_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_extras" ADD CONSTRAINT "vehicle_extras_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_extras" ADD CONSTRAINT "booking_extras_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_extras" ADD CONSTRAINT "booking_extras_vehicleExtraId_fkey" FOREIGN KEY ("vehicleExtraId") REFERENCES "vehicle_extras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_agreements" ADD CONSTRAINT "rental_agreements_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_agreements" ADD CONSTRAINT "rental_agreements_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_inspections" ADD CONSTRAINT "trip_inspections_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "rental_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
