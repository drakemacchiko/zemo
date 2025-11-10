-- CreateTable
CREATE TABLE "insurance_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverageType" TEXT NOT NULL,
    "maxCoverageAmount" REAL NOT NULL,
    "deductibleAmount" REAL NOT NULL,
    "accidentCoverage" BOOLEAN NOT NULL DEFAULT true,
    "theftCoverage" BOOLEAN NOT NULL DEFAULT false,
    "vandalismCoverage" BOOLEAN NOT NULL DEFAULT false,
    "naturalDisasterCoverage" BOOLEAN NOT NULL DEFAULT false,
    "thirdPartyCoverage" BOOLEAN NOT NULL DEFAULT true,
    "dailyRate" REAL NOT NULL,
    "weeklyRate" REAL,
    "monthlyRate" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "insuranceProvider" TEXT NOT NULL DEFAULT 'ZEMO_PARTNER',
    "policyTermsUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "insuranceId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "coverageAmount" REAL NOT NULL,
    "premiumAmount" REAL NOT NULL,
    "deductibleAmount" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "providerPolicyId" TEXT,
    "providerReference" TEXT,
    "policyDocumentUrl" TEXT,
    "activatedAt" DATETIME,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "insurance_policies_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "insurance_policies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "insurance_policies_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "insurance_products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policyId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "incidentDate" DATETIME NOT NULL,
    "incidentLocation" TEXT NOT NULL,
    "incidentDescription" TEXT NOT NULL,
    "claimType" TEXT NOT NULL,
    "estimatedDamageAmount" REAL,
    "actualDamageAmount" REAL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "policeReportNumber" TEXT,
    "insurerClaimId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "settlementAmount" REAL,
    "settlementDate" DATETIME,
    "settlementNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "claims_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "insurance_policies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "claims_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "claim_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "description" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "claim_documents_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vehicle_inspections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectionType" TEXT NOT NULL,
    "inspectionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mileage" INTEGER NOT NULL,
    "fuelLevel" REAL NOT NULL,
    "overallCondition" TEXT NOT NULL,
    "damageScore" REAL NOT NULL DEFAULT 0,
    "estimatedRepairCost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "concerns" TEXT,
    "locationLatitude" REAL,
    "locationLongitude" REAL,
    "locationAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acknowledgedBy" TEXT,
    "acknowledgedAt" DATETIME,
    "disputeRaised" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vehicle_inspections_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vehicle_inspections_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inspection_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspectionId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "photoType" TEXT NOT NULL,
    "viewAngle" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "isDamagePhoto" BOOLEAN NOT NULL DEFAULT false,
    "damageDescription" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "takenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inspection_photos_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "vehicle_inspections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "damage_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspectionId" TEXT NOT NULL,
    "damageType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repairRequired" BOOLEAN NOT NULL DEFAULT true,
    "estimatedCost" REAL NOT NULL DEFAULT 0,
    "actualCost" REAL,
    "photoUrls" JSONB,
    "isDisputed" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "resolutionNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "damage_items_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "vehicle_inspections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deposit_adjustments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "pickupInspectionId" TEXT,
    "returnInspectionId" TEXT,
    "originalDeposit" REAL NOT NULL,
    "damageCharges" REAL NOT NULL DEFAULT 0,
    "cleaningCharges" REAL NOT NULL DEFAULT 0,
    "fuelCharges" REAL NOT NULL DEFAULT 0,
    "otherCharges" REAL NOT NULL DEFAULT 0,
    "adjustmentAmount" REAL NOT NULL,
    "finalDepositReturn" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processedBy" TEXT,
    "processedAt" DATETIME,
    "justification" TEXT,
    "evidenceUrls" JSONB,
    "isDisputed" BOOLEAN NOT NULL DEFAULT false,
    "disputeReason" TEXT,
    "disputeResolvedBy" TEXT,
    "disputeResolvedAt" DATETIME,
    "paymentId" TEXT,
    "refundId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "deposit_adjustments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "insurance_policies_bookingId_key" ON "insurance_policies"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_policies_policyNumber_key" ON "insurance_policies"("policyNumber");

-- CreateIndex
CREATE INDEX "insurance_policies_userId_idx" ON "insurance_policies"("userId");

-- CreateIndex
CREATE INDEX "insurance_policies_status_idx" ON "insurance_policies"("status");

-- CreateIndex
CREATE INDEX "insurance_policies_policyNumber_idx" ON "insurance_policies"("policyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "claims_claimNumber_key" ON "claims"("claimNumber");

-- CreateIndex
CREATE INDEX "claims_userId_idx" ON "claims"("userId");

-- CreateIndex
CREATE INDEX "claims_policyId_idx" ON "claims"("policyId");

-- CreateIndex
CREATE INDEX "claims_bookingId_idx" ON "claims"("bookingId");

-- CreateIndex
CREATE INDEX "claims_status_idx" ON "claims"("status");

-- CreateIndex
CREATE INDEX "claims_claimNumber_idx" ON "claims"("claimNumber");

-- CreateIndex
CREATE INDEX "claim_documents_claimId_idx" ON "claim_documents"("claimId");

-- CreateIndex
CREATE INDEX "claim_documents_documentType_idx" ON "claim_documents"("documentType");

-- CreateIndex
CREATE INDEX "vehicle_inspections_bookingId_idx" ON "vehicle_inspections"("bookingId");

-- CreateIndex
CREATE INDEX "vehicle_inspections_vehicleId_idx" ON "vehicle_inspections"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_inspections_inspectionType_idx" ON "vehicle_inspections"("inspectionType");

-- CreateIndex
CREATE INDEX "vehicle_inspections_status_idx" ON "vehicle_inspections"("status");

-- CreateIndex
CREATE INDEX "inspection_photos_inspectionId_idx" ON "inspection_photos"("inspectionId");

-- CreateIndex
CREATE INDEX "inspection_photos_photoType_idx" ON "inspection_photos"("photoType");

-- CreateIndex
CREATE INDEX "damage_items_inspectionId_idx" ON "damage_items"("inspectionId");

-- CreateIndex
CREATE INDEX "damage_items_damageType_idx" ON "damage_items"("damageType");

-- CreateIndex
CREATE INDEX "damage_items_severity_idx" ON "damage_items"("severity");

-- CreateIndex
CREATE INDEX "deposit_adjustments_bookingId_idx" ON "deposit_adjustments"("bookingId");

-- CreateIndex
CREATE INDEX "deposit_adjustments_status_idx" ON "deposit_adjustments"("status");
