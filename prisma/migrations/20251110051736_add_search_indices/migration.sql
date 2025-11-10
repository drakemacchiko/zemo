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
