-- CreateEnum
CREATE TYPE "UserDocumentType" AS ENUM ('LICENSE', 'NATIONAL_ID', 'PASSPORT', 'SELFIE', 'PROOF_OF_ADDRESS', 'VEHICLE_REGISTRATION', 'INSURANCE_CERT', 'ROADWORTHINESS', 'BANK_STATEMENT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('NOT_UPLOADED', 'UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "UserDocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "ocrData" JSONB,
    "ocrConfidence" DOUBLE PRECISION,
    "expiryDate" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "documents"("userId");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
