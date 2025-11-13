-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'HOST', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('SEDAN', 'SUV', 'HATCHBACK', 'PICKUP', 'VAN', 'COUPE', 'CONVERTIBLE', 'WAGON');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LOGBOOK', 'INSURANCE', 'ROAD_TAX', 'INSPECTION');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('EXTERIOR_FRONT', 'EXTERIOR_REAR', 'EXTERIOR_LEFT', 'EXTERIOR_RIGHT', 'INTERIOR_FRONT', 'INTERIOR_REAR', 'DASHBOARD', 'ENGINE', 'OTHER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BOOKING_PAYMENT', 'SECURITY_DEPOSIT', 'REFUND', 'PARTIAL_REFUND', 'DAMAGE_CHARGE');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('AIRTEL_MONEY', 'MTN_MOMO', 'ZAMTEL_KWACHA', 'STRIPE', 'DPO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'HELD', 'RELEASED');

-- CreateEnum
CREATE TYPE "PaymentIntent" AS ENUM ('PAYMENT', 'HOLD', 'REFUND');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('MOBILE_MONEY', 'CREDIT_CARD', 'DEBIT_CARD');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CHARGE', 'HOLD', 'CAPTURE', 'REFUND', 'RELEASE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CoverageType" AS ENUM ('BASIC', 'COMPREHENSIVE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('ACCIDENT', 'THEFT', 'VANDALISM', 'NATURAL_DISASTER', 'MECHANICAL', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING', 'APPROVED', 'REJECTED', 'SETTLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClaimPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ClaimDocumentType" AS ENUM ('PHOTOS', 'POLICE_REPORT', 'MEDICAL_REPORT', 'REPAIR_INVOICE', 'RECEIPT', 'WITNESS_STATEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('PICKUP', 'RETURN', 'INTERMEDIATE', 'DAMAGE_ASSESSMENT');

-- CreateEnum
CREATE TYPE "VehicleCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PENDING', 'COMPLETED', 'ACKNOWLEDGED', 'DISPUTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "InspectionPhotoType" AS ENUM ('EXTERIOR_OVERVIEW', 'INTERIOR_OVERVIEW', 'DASHBOARD', 'DAMAGE_CLOSEUP', 'FUEL_GAUGE', 'MILEAGE', 'TIRE_CONDITION', 'SCRATCH_DENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DamageType" AS ENUM ('SCRATCH', 'DENT', 'CRACK', 'BROKEN_PART', 'MISSING_PART', 'INTERIOR_DAMAGE', 'MECHANICAL_ISSUE', 'ELECTRICAL_ISSUE', 'TIRE_DAMAGE', 'FLUID_LEAK', 'OTHER');

-- CreateEnum
CREATE TYPE "DamageSeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'SEVERE');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'CALCULATED', 'APPROVED', 'PROCESSED', 'DISPUTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'SYSTEM', 'BOOKING_UPDATE', 'PAYMENT_UPDATE', 'IMAGE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'MESSAGE_RECEIVED', 'VEHICLE_APPROVED', 'DOCUMENT_REQUIRED', 'INSPECTION_DUE', 'SUPPORT_RESPONSE', 'SYSTEM_ANNOUNCEMENT', 'MARKETING');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('BOOKING_ISSUE', 'PAYMENT_ISSUE', 'VEHICLE_ISSUE', 'TECHNICAL_SUPPORT', 'ACCOUNT_ISSUE', 'DAMAGE_DISPUTE', 'REFUND_REQUEST', 'FEATURE_REQUEST', 'COMPLAINT', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "permissions" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaBackupCodes" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Zambia',
    "profilePictureUrl" TEXT,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "kycDocuments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driving_licenses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "issuingCountry" TEXT NOT NULL DEFAULT 'Zambia',
    "licenseClass" TEXT NOT NULL,
    "documentUrl" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driving_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "engineNumber" TEXT,
    "chassisNumber" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "seatingCapacity" INTEGER NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "weeklyRate" DOUBLE PRECISION,
    "monthlyRate" DOUBLE PRECISION,
    "securityDeposit" DOUBLE PRECISION NOT NULL,
    "currentMileage" INTEGER NOT NULL,
    "fuelTankCapacity" DOUBLE PRECISION,
    "locationLatitude" DOUBLE PRECISION NOT NULL,
    "locationLongitude" DOUBLE PRECISION NOT NULL,
    "locationAddress" TEXT NOT NULL,
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "features" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_documents" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "documentUrl" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_photos" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "photoType" "PhotoType" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "securityDeposit" DOUBLE PRECISION NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "confirmationNumber" TEXT NOT NULL,
    "pickupLocation" TEXT,
    "dropoffLocation" TEXT,
    "specialRequests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZMW',
    "paymentType" "PaymentType" NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "intent" "PaymentIntent" NOT NULL DEFAULT 'PAYMENT',
    "providerTransactionId" TEXT,
    "providerReference" TEXT,
    "paymentMethodId" TEXT,
    "failureReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "token" TEXT NOT NULL,
    "last4" TEXT,
    "brand" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "phoneNumber" TEXT,
    "accountName" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "providerTransactionId" TEXT,
    "providerReference" TEXT,
    "reconciledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverageType" "CoverageType" NOT NULL,
    "maxCoverageAmount" DOUBLE PRECISION NOT NULL,
    "deductibleAmount" DOUBLE PRECISION NOT NULL,
    "accidentCoverage" BOOLEAN NOT NULL DEFAULT true,
    "theftCoverage" BOOLEAN NOT NULL DEFAULT false,
    "vandalismCoverage" BOOLEAN NOT NULL DEFAULT false,
    "naturalDisasterCoverage" BOOLEAN NOT NULL DEFAULT false,
    "thirdPartyCoverage" BOOLEAN NOT NULL DEFAULT true,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "weeklyRate" DOUBLE PRECISION,
    "monthlyRate" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "insuranceProvider" TEXT NOT NULL DEFAULT 'ZEMO_PARTNER',
    "policyTermsUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "insuranceId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "coverageAmount" DOUBLE PRECISION NOT NULL,
    "premiumAmount" DOUBLE PRECISION NOT NULL,
    "deductibleAmount" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'PENDING',
    "providerPolicyId" TEXT,
    "providerReference" TEXT,
    "policyDocumentUrl" TEXT,
    "activatedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "incidentLocation" TEXT NOT NULL,
    "incidentDescription" TEXT NOT NULL,
    "claimType" "ClaimType" NOT NULL,
    "estimatedDamageAmount" DOUBLE PRECISION,
    "actualDamageAmount" DOUBLE PRECISION,
    "status" "ClaimStatus" NOT NULL DEFAULT 'SUBMITTED',
    "priority" "ClaimPriority" NOT NULL DEFAULT 'NORMAL',
    "policeReportNumber" TEXT,
    "insurerClaimId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "settlementAmount" DOUBLE PRECISION,
    "settlementDate" TIMESTAMP(3),
    "settlementNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_documents" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "documentType" "ClaimDocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "description" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_inspections" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectionType" "InspectionType" NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mileage" INTEGER NOT NULL,
    "fuelLevel" DOUBLE PRECISION NOT NULL,
    "overallCondition" "VehicleCondition" NOT NULL,
    "damageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedRepairCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "concerns" TEXT,
    "locationLatitude" DOUBLE PRECISION,
    "locationLongitude" DOUBLE PRECISION,
    "locationAddress" TEXT,
    "status" "InspectionStatus" NOT NULL DEFAULT 'PENDING',
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "disputeRaised" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_photos" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "photoType" "InspectionPhotoType" NOT NULL,
    "viewAngle" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "isDamagePhoto" BOOLEAN NOT NULL DEFAULT false,
    "damageDescription" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "damage_items" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "damageType" "DamageType" NOT NULL,
    "severity" "DamageSeverity" NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repairRequired" BOOLEAN NOT NULL DEFAULT true,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualCost" DOUBLE PRECISION,
    "photoUrls" JSONB,
    "isDisputed" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "damage_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposit_adjustments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "pickupInspectionId" TEXT,
    "returnInspectionId" TEXT,
    "originalDeposit" DOUBLE PRECISION NOT NULL,
    "damageCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cleaningCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fuelCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adjustmentAmount" DOUBLE PRECISION NOT NULL,
    "finalDepositReturn" DOUBLE PRECISION NOT NULL,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "justification" TEXT,
    "evidenceUrls" JSONB,
    "isDisputed" BOOLEAN NOT NULL DEFAULT false,
    "disputeReason" TEXT,
    "disputeResolvedBy" TEXT,
    "disputeResolvedAt" TIMESTAMP(3),
    "paymentId" TEXT,
    "refundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposit_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "bookingId" TEXT,
    "vehicleId" TEXT,
    "title" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "hostDeleted" BOOLEAN NOT NULL DEFAULT false,
    "renterDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "attachmentUrl" TEXT,
    "attachmentType" "AttachmentType",
    "attachmentSize" INTEGER,
    "systemMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "deliveryChannels" TEXT NOT NULL DEFAULT 'IN_APP',
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "smsSent" BOOLEAN NOT NULL DEFAULT false,
    "smsSentAt" TIMESTAMP(3),
    "pushSent" BOOLEAN NOT NULL DEFAULT false,
    "pushSentAt" TIMESTAMP(3),
    "bookingId" TEXT,
    "vehicleId" TEXT,
    "conversationId" TEXT,
    "ticketId" TEXT,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "scheduledFor" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bookingUpdates" BOOLEAN NOT NULL DEFAULT true,
    "paymentUpdates" BOOLEAN NOT NULL DEFAULT true,
    "messageAlerts" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" INTEGER,
    "quietHoursEnd" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lusaka',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedToId" TEXT,
    "bookingId" TEXT,
    "vehicleId" TEXT,
    "paymentId" TEXT,
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "customerRating" INTEGER,
    "customerFeedback" TEXT,
    "internalNotes" TEXT,
    "tags" JSONB,
    "escalatedAt" TIMESTAMP(3),
    "escalatedBy" TEXT,
    "escalationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_attachments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "driving_licenses_userId_key" ON "driving_licenses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "driving_licenses_licenseNumber_key" ON "driving_licenses"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plateNumber_key" ON "vehicles"("plateNumber");

-- CreateIndex
CREATE INDEX "vehicles_hostId_idx" ON "vehicles"("hostId");

-- CreateIndex
CREATE INDEX "vehicles_availabilityStatus_isActive_idx" ON "vehicles"("availabilityStatus", "isActive");

-- CreateIndex
CREATE INDEX "vehicles_locationLatitude_locationLongitude_idx" ON "vehicles"("locationLatitude", "locationLongitude");

-- CreateIndex
CREATE INDEX "vehicles_vehicleType_availabilityStatus_isActive_idx" ON "vehicles"("vehicleType", "availabilityStatus", "isActive");

-- CreateIndex
CREATE INDEX "vehicles_make_model_idx" ON "vehicles"("make", "model");

-- CreateIndex
CREATE INDEX "vehicles_dailyRate_idx" ON "vehicles"("dailyRate");

-- CreateIndex
CREATE INDEX "vehicles_seatingCapacity_idx" ON "vehicles"("seatingCapacity");

-- CreateIndex
CREATE INDEX "vehicles_year_make_idx" ON "vehicles"("year", "make");

-- CreateIndex
CREATE INDEX "vehicles_verificationStatus_availabilityStatus_idx" ON "vehicles"("verificationStatus", "availabilityStatus");

-- CreateIndex
CREATE INDEX "vehicles_createdAt_idx" ON "vehicles"("createdAt");

-- CreateIndex
CREATE INDEX "vehicle_documents_vehicleId_idx" ON "vehicle_documents"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_photos_vehicleId_idx" ON "vehicle_photos"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_confirmationNumber_key" ON "bookings"("confirmationNumber");

-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");

-- CreateIndex
CREATE INDEX "bookings_vehicleId_idx" ON "bookings"("vehicleId");

-- CreateIndex
CREATE INDEX "bookings_hostId_idx" ON "bookings"("hostId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_startDate_endDate_idx" ON "bookings"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_vehicleId_startDate_endDate_key" ON "bookings"("vehicleId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "payments_bookingId_idx" ON "payments"("bookingId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_provider_idx" ON "payments"("provider");

-- CreateIndex
CREATE INDEX "payments_providerTransactionId_idx" ON "payments"("providerTransactionId");

-- CreateIndex
CREATE INDEX "payment_methods_userId_idx" ON "payment_methods"("userId");

-- CreateIndex
CREATE INDEX "payment_methods_type_idx" ON "payment_methods"("type");

-- CreateIndex
CREATE INDEX "payment_methods_provider_idx" ON "payment_methods"("provider");

-- CreateIndex
CREATE INDEX "transactions_paymentId_idx" ON "transactions"("paymentId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_providerTransactionId_idx" ON "transactions"("providerTransactionId");

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

-- CreateIndex
CREATE INDEX "conversations_hostId_idx" ON "conversations"("hostId");

-- CreateIndex
CREATE INDEX "conversations_renterId_idx" ON "conversations"("renterId");

-- CreateIndex
CREATE INDEX "conversations_bookingId_idx" ON "conversations"("bookingId");

-- CreateIndex
CREATE INDEX "conversations_vehicleId_idx" ON "conversations"("vehicleId");

-- CreateIndex
CREATE INDEX "conversations_lastMessageAt_idx" ON "conversations"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_hostId_renterId_bookingId_key" ON "conversations"("hostId", "renterId", "bookingId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_isRead_idx" ON "messages"("isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_scheduledFor_idx" ON "notifications"("scheduledFor");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_userId_idx" ON "support_tickets"("userId");

-- CreateIndex
CREATE INDEX "support_tickets_ticketNumber_idx" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_category_idx" ON "support_tickets"("category");

-- CreateIndex
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets"("priority");

-- CreateIndex
CREATE INDEX "support_tickets_assignedToId_idx" ON "support_tickets"("assignedToId");

-- CreateIndex
CREATE INDEX "support_tickets_createdAt_idx" ON "support_tickets"("createdAt");

-- CreateIndex
CREATE INDEX "ticket_messages_ticketId_idx" ON "ticket_messages"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_messages_senderId_idx" ON "ticket_messages"("senderId");

-- CreateIndex
CREATE INDEX "ticket_messages_isInternal_idx" ON "ticket_messages"("isInternal");

-- CreateIndex
CREATE INDEX "ticket_messages_createdAt_idx" ON "ticket_messages"("createdAt");

-- CreateIndex
CREATE INDEX "ticket_attachments_ticketId_idx" ON "ticket_attachments"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_attachments_uploadedBy_idx" ON "ticket_attachments"("uploadedBy");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driving_licenses" ADD CONSTRAINT "driving_licenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_documents" ADD CONSTRAINT "vehicle_documents_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_photos" ADD CONSTRAINT "vehicle_photos_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "insurance_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "insurance_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_documents" ADD CONSTRAINT "claim_documents_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_photos" ADD CONSTRAINT "inspection_photos_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "vehicle_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "damage_items" ADD CONSTRAINT "damage_items_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "vehicle_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit_adjustments" ADD CONSTRAINT "deposit_adjustments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
