import { prisma } from '@/lib/db'

// Insurance pricing service
export class InsurancePricingService {
  /**
   * Calculate insurance premium for a booking
   */
  static async calculatePremium(
    insuranceId: string,
    vehicleValue: number,
    startDate: Date,
    endDate: Date,
    coverageAmount?: number
  ): Promise<{ dailyPremium: number; totalPremium: number; coverageAmount: number }> {
    // Get insurance product details
    const insurance = await prisma.insurance.findUnique({
      where: { id: insuranceId, isActive: true },
    })

    if (!insurance) {
      throw new Error('Insurance product not found or inactive')
    }

    // Calculate booking duration in days
    const durationMs = endDate.getTime() - startDate.getTime()
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

    if (durationDays <= 0) {
      throw new Error('Invalid booking duration')
    }

    // Determine coverage amount (use provided or default to max coverage)
    const finalCoverageAmount = coverageAmount || insurance.maxCoverageAmount

    if (finalCoverageAmount > insurance.maxCoverageAmount) {
      throw new Error(`Coverage amount cannot exceed ${insurance.maxCoverageAmount}`)
    }

    // Base daily premium from insurance product
    let dailyPremium = insurance.dailyRate

    // Apply coverage amount adjustment (higher coverage = higher premium)
    const coverageRatio = finalCoverageAmount / insurance.maxCoverageAmount
    dailyPremium = dailyPremium * (0.5 + 0.5 * coverageRatio) // 50% base + 50% based on coverage

    // Apply vehicle value adjustment (higher value = higher premium)
    if (vehicleValue > 50000) {
      dailyPremium *= 1.5 // 50% increase for high-value vehicles
    } else if (vehicleValue > 25000) {
      dailyPremium *= 1.25 // 25% increase for mid-value vehicles
    }

    // Apply duration discounts for longer bookings
    if (durationDays >= 30) {
      dailyPremium *= 0.8 // 20% discount for monthly bookings
    } else if (durationDays >= 7) {
      dailyPremium *= 0.9 // 10% discount for weekly bookings
    }

    // Calculate total premium
    const totalPremium = dailyPremium * durationDays

    return {
      dailyPremium: Math.round(dailyPremium * 100) / 100, // Round to 2 decimal places
      totalPremium: Math.round(totalPremium * 100) / 100,
      coverageAmount: finalCoverageAmount,
    }
  }

  /**
   * Get all available insurance options
   */
  static async getAvailableInsurance() {
    return await prisma.insurance.findMany({
      where: { isActive: true },
      orderBy: { dailyRate: 'asc' },
    })
  }

  /**
   * Create insurance policy for a booking
   */
  static async createPolicy(
    bookingId: string,
    userId: string,
    insuranceId: string,
    coverageAmount: number,
    premiumAmount: number,
    startDate: Date,
    endDate: Date
  ) {
    // Check if booking already has a policy
    const existingPolicy = await prisma.insurancePolicy.findUnique({
      where: { bookingId },
    })

    if (existingPolicy) {
      throw new Error('Booking already has an insurance policy')
    }

    // Generate policy number
    const policyNumber = this.generatePolicyNumber()

    // Get insurance product details for deductible
    const insurance = await prisma.insurance.findUnique({
      where: { id: insuranceId },
    })

    if (!insurance) {
      throw new Error('Insurance product not found')
    }

    // Create policy
    return await prisma.insurancePolicy.create({
      data: {
        bookingId,
        userId,
        insuranceId,
        policyNumber,
        coverageAmount,
        premiumAmount,
        deductibleAmount: insurance.deductibleAmount,
        startDate,
        endDate,
        status: 'PENDING',
      },
      include: {
        insurance: true,
        booking: {
          include: {
            vehicle: true,
          },
        },
      },
    })
  }

  /**
   * Activate insurance policy
   */
  static async activatePolicy(policyId: string) {
    return await prisma.insurancePolicy.update({
      where: { id: policyId },
      data: {
        status: 'ACTIVE',
        activatedAt: new Date(),
      },
    })
  }

  /**
   * Cancel insurance policy
   */
  static async cancelPolicy(policyId: string, _reason?: string) {
    return await prisma.insurancePolicy.update({
      where: { id: policyId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })
  }

  /**
   * Generate unique policy number
   */
  private static generatePolicyNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ZEMO-${timestamp}-${randomStr}`
  }
}

// Insurance claim service
export class ClaimService {
  /**
   * Create a new claim
   */
  static async createClaim(
    policyId: string,
    userId: string,
    claimData: {
      incidentDate: Date
      incidentLocation: string
      incidentDescription: string
      claimType: string
      estimatedDamageAmount?: number
      policeReportNumber?: string
    }
  ) {
    // Verify policy exists and is active
    const policy = await prisma.insurancePolicy.findUnique({
      where: { id: policyId },
      include: { booking: true },
    })

    if (!policy) {
      throw new Error('Insurance policy not found')
    }

    if (policy.status !== 'ACTIVE') {
      throw new Error('Insurance policy is not active')
    }

    if (policy.userId !== userId) {
      throw new Error('Unauthorized to create claim for this policy')
    }

    // Verify incident date is within policy period
    if (claimData.incidentDate < policy.startDate || claimData.incidentDate > policy.endDate) {
      throw new Error('Incident date is outside the policy coverage period')
    }

    // Generate claim number
    const claimNumber = this.generateClaimNumber()

    // Create claim
    return await prisma.claim.create({
      data: {
        policyId,
        bookingId: policy.bookingId,
        userId,
        claimNumber,
        incidentDate: claimData.incidentDate,
        incidentLocation: claimData.incidentLocation,
        incidentDescription: claimData.incidentDescription,
        claimType: claimData.claimType as any, // Type assertion for enum
        estimatedDamageAmount: claimData.estimatedDamageAmount || null,
        policeReportNumber: claimData.policeReportNumber || null,
        status: 'SUBMITTED',
        priority: 'NORMAL',
      },
      include: {
        policy: {
          include: {
            insurance: true,
            booking: {
              include: {
                vehicle: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * Update claim status (admin only)
   */
  static async updateClaim(
    claimId: string,
    updateData: {
      status?: string
      reviewNotes?: string
      actualDamageAmount?: number
      settlementAmount?: number
      priority?: string
    },
    reviewerId?: string
  ) {
    const updatePayload: any = {
      ...updateData,
      updatedAt: new Date(),
    }

    if (reviewerId) {
      updatePayload.reviewedBy = reviewerId
      updatePayload.reviewedAt = new Date()
    }

    if (updateData.settlementAmount !== undefined) {
      updatePayload.settlementDate = new Date()
    }

    return await prisma.claim.update({
      where: { id: claimId },
      data: updatePayload,
      include: {
        policy: {
          include: {
            insurance: true,
            booking: {
              include: {
                vehicle: true,
              },
            },
          },
        },
        documents: true,
      },
    })
  }

  /**
   * Get claim by ID
   */
  static async getClaimById(claimId: string, userId?: string) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        policy: {
          include: {
            insurance: true,
            booking: {
              include: {
                vehicle: true,
              },
            },
          },
        },
        documents: true,
      },
    })

    if (!claim) {
      throw new Error('Claim not found')
    }

    // Check authorization if userId provided
    if (userId && claim.userId !== userId) {
      throw new Error('Unauthorized to view this claim')
    }

    return claim
  }

  /**
   * Search claims with filters
   */
  static async searchClaims(filters: {
    status?: string
    claimType?: string
    priority?: string
    userId?: string
    policyId?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }) {
    const { page = 1, limit = 20, ...whereFilters } = filters

    const where: any = {}

    if (whereFilters.status) where.status = whereFilters.status
    if (whereFilters.claimType) where.claimType = whereFilters.claimType
    if (whereFilters.priority) where.priority = whereFilters.priority
    if (whereFilters.userId) where.userId = whereFilters.userId
    if (whereFilters.policyId) where.policyId = whereFilters.policyId

    if (whereFilters.startDate || whereFilters.endDate) {
      where.incidentDate = {}
      if (whereFilters.startDate) where.incidentDate.gte = whereFilters.startDate
      if (whereFilters.endDate) where.incidentDate.lte = whereFilters.endDate
    }

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          policy: {
            include: {
              insurance: true,
              booking: {
                include: {
                  vehicle: true,
                },
              },
            },
          },
          documents: true,
        },
      }),
      prisma.claim.count({ where }),
    ])

    return {
      claims,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Generate unique claim number
   */
  private static generateClaimNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `CLM-${timestamp}-${randomStr}`
  }
}