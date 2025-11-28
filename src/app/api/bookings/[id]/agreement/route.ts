import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth'
import { generateRentalAgreementPDF } from '@/lib/pdf-generator'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const bookingId = params.id

    // Fetch booking with all required data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: {
          include: {
            host: {
              include: {
                profile: true
              }
            }
          }
        },
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify user is either host or renter
    if (booking.userId !== userId && booking.vehicle.hostId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if agreement already exists
    let agreement = await prisma.rentalAgreement.findUnique({
      where: { bookingId }
    })

    // If no agreement exists, create one
    const agreementNumber = `ZEMO-${Date.now()}-${bookingId.slice(0, 8).toUpperCase()}`
    
    if (!agreement) {
      agreement = await prisma.rentalAgreement.create({
        data: {
          bookingId,
          vehicleId: booking.vehicleId,
          hostId: booking.vehicle.hostId,
          renterId: booking.userId,
          agreementTemplate: 'STANDARD_V1',
          agreementContent: '',
          hostSigned: false,
          renterSigned: false,
          fullyExecuted: false
        }
      })
    }

    // Prepare data for agreement
    const totalDays = Math.ceil(
      (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    )

    const agreementData = {
      hostName: `${booking.vehicle.host.profile?.firstName || ''} ${booking.vehicle.host.profile?.lastName || ''}`.trim() || booking.vehicle.host.email,
      hostEmail: booking.vehicle.host.email,
      hostPhone: booking.vehicle.host.phoneNumber || 'N/A',
      hostAddress: 'Address on file',
      renterName: `${booking.user.profile?.firstName || ''} ${booking.user.profile?.lastName || ''}`.trim() || booking.user.email,
      renterEmail: booking.user.email,
      renterPhone: booking.user.phoneNumber || 'N/A',
      renterAddress: 'Address on file',
      renterLicense: 'License on file',
      vehicleMake: booking.vehicle.make,
      vehicleModel: booking.vehicle.model,
      vehicleYear: booking.vehicle.year.toString(),
      vehiclePlate: booking.vehicle.plateNumber,
      vehicleVin: booking.vehicle.vin || 'N/A',
      rentalStartDate: booking.startDate.toISOString(),
      rentalEndDate: booking.endDate.toISOString(),
      pickupLocation: booking.pickupLocation || 'To be arranged',
      returnLocation: booking.pickupLocation || 'To be arranged',
      dailyRate: booking.vehicle.dailyRate,
      totalDays: totalDays,
      totalCost: booking.totalAmount,
      securityDeposit: booking.vehicle.securityDeposit || 0,
      mileageAllowance: 200,
      extraMileageFee: 5,
      fuelPolicy: 'Return with same fuel level',
      insurancePlan: 'Standard Coverage',
      additionalRules: [],
    }

    // Generate PDF using jsPDF
    const pdfBlob = await generateRentalAgreementPDF(agreementData)
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

    // Upload PDF to Supabase Storage using server-only keys
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let publicUrl: string | undefined

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const fileName = `agreements/${bookingId}/${agreementNumber}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('Failed to upload PDF:', uploadError)
      return NextResponse.json({ error: 'Failed to upload agreement' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)
    publicUrl = urlData.publicUrl

    // Update agreement with PDF URL
    await prisma.rentalAgreement.update({
      where: { id: agreement.id },
      data: {
        agreementContent: publicUrl || '',
      },
    })

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rental-agreement-${agreementNumber}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating agreement:', error)
    return NextResponse.json(
      { error: 'Failed to generate rental agreement' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const bookingId = params.id

    const agreement = await prisma.rentalAgreement.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            vehicle: {
              include: {
                host: {
                  include: { profile: true }
                }
              }
            },
            user: {
              include: { profile: true }
            }
          }
        }
      }
    })

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    return NextResponse.json({ agreement })
  } catch (error) {
    console.error('Error fetching agreement:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agreement' },
      { status: 500 }
    )
  }
}
