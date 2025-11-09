import { NextRequest, NextResponse } from 'next/server'
import { InsurancePricingService } from '@/lib/insurance'

// GET /api/insurance/options
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vehicleValue = searchParams.get('vehicleValue')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get all available insurance options
    const insuranceOptions = await InsurancePricingService.getAvailableInsurance()

    // If pricing parameters provided, calculate premiums for each option
    if (vehicleValue && startDate && endDate) {
      const vehicleValueNum = parseFloat(vehicleValue)
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)

      if (isNaN(vehicleValueNum) || isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid pricing parameters' },
          { status: 400 }
        )
      }

      // Calculate pricing for each insurance option
      const optionsWithPricing = await Promise.all(
        insuranceOptions.map(async (insurance: any) => {
          try {
            const pricing = await InsurancePricingService.calculatePremium(
              insurance.id,
              vehicleValueNum,
              startDateObj,
              endDateObj
            )
            return {
              ...insurance,
              pricing,
            }
          } catch (error) {
            // If pricing calculation fails for this option, return without pricing
            return insurance
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: optionsWithPricing,
      })
    }

    // Return options without pricing
    return NextResponse.json({
      success: true,
      data: insuranceOptions,
    })
  } catch (error) {
    console.error('Error fetching insurance options:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insurance options' },
      { status: 500 }
    )
  }
}