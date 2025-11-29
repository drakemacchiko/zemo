-- CreateEnum
CREATE TYPE "ExtensionStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED', 'PAID', 'ACTIVE');

-- CreateEnum
CREATE TYPE "EarlyReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REFUNDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LateReturnStatus" AS ENUM ('DETECTED', 'NOTIFIED', 'EXTENDED', 'RETURNED', 'ESCALATED', 'RESOLVED');

-- CreateTable
CREATE TABLE "trip_extensions" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "originalEndDate" TIMESTAMP(3) NOT NULL,
    "newEndDate" TIMESTAMP(3) NOT NULL,
    "additionalDays" INTEGER NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "extensionSubtotal" DOUBLE PRECISION NOT NULL,
    "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExtensionCost" DOUBLE PRECISION NOT NULL,
    "status" "ExtensionStatus" NOT NULL DEFAULT 'PENDING',
    "respondedBy" TEXT,
    "responseMessage" TEXT,
    "declineReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paymentId" TEXT,

    CONSTRAINT "trip_extensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "early_returns" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "originalEndDate" TIMESTAMP(3) NOT NULL,
    "actualReturnDate" TIMESTAMP(3) NOT NULL,
    "daysUnused" INTEGER NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "refundAmount" DOUBLE PRECISION NOT NULL,
    "refundReason" TEXT,
    "policyApplied" TEXT,
    "status" "EarlyReturnStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundId" TEXT,

    CONSTRAINT "early_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "late_returns" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "originalEndDate" TIMESTAMP(3) NOT NULL,
    "actualReturnDate" TIMESTAMP(3),
    "hoursLate" INTEGER NOT NULL,
    "hourlyLateFee" DOUBLE PRECISION NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "totalLateFee" DOUBLE PRECISION NOT NULL,
    "capped" BOOLEAN NOT NULL DEFAULT false,
    "status" "LateReturnStatus" NOT NULL DEFAULT 'DETECTED',
    "lateFeesWaived" BOOLEAN NOT NULL DEFAULT false,
    "waivedBy" TEXT,
    "waiverReason" TEXT,
    "feesCharged" BOOLEAN NOT NULL DEFAULT false,
    "chargedAt" TIMESTAMP(3),
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "escalatedAt" TIMESTAMP(3),
    "escalationNotes" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "feePaymentId" TEXT,

    CONSTRAINT "late_returns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trip_extensions_paymentId_key" ON "trip_extensions"("paymentId");

-- CreateIndex
CREATE INDEX "trip_extensions_bookingId_idx" ON "trip_extensions"("bookingId");

-- CreateIndex
CREATE INDEX "trip_extensions_status_idx" ON "trip_extensions"("status");

-- CreateIndex
CREATE INDEX "trip_extensions_requestedBy_idx" ON "trip_extensions"("requestedBy");

-- CreateIndex
CREATE UNIQUE INDEX "early_returns_refundId_key" ON "early_returns"("refundId");

-- CreateIndex
CREATE INDEX "early_returns_bookingId_idx" ON "early_returns"("bookingId");

-- CreateIndex
CREATE INDEX "early_returns_status_idx" ON "early_returns"("status");

-- CreateIndex
CREATE UNIQUE INDEX "late_returns_feePaymentId_key" ON "late_returns"("feePaymentId");

-- CreateIndex
CREATE INDEX "late_returns_bookingId_idx" ON "late_returns"("bookingId");

-- CreateIndex
CREATE INDEX "late_returns_status_idx" ON "late_returns"("status");

-- AddForeignKey
ALTER TABLE "trip_extensions" ADD CONSTRAINT "trip_extensions_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_extensions" ADD CONSTRAINT "trip_extensions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "early_returns" ADD CONSTRAINT "early_returns_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "early_returns" ADD CONSTRAINT "early_returns_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "late_returns" ADD CONSTRAINT "late_returns_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "late_returns" ADD CONSTRAINT "late_returns_feePaymentId_fkey" FOREIGN KEY ("feePaymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
