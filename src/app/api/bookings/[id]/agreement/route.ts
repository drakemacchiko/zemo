import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { prisma } from '@/lib/db'
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth'
import { generateRentalAgreementHTML, RentalAgreementData } from '@/lib/agreements/rental-agreement-template'

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

    const agreementData: RentalAgreementData = {
      bookingId: booking.id,
      agreementNumber: agreementNumber,
      host: {
        name: `${booking.vehicle.host.profile?.firstName || ''} ${booking.vehicle.host.profile?.lastName || ''}`.trim() || booking.vehicle.host.email,
        email: booking.vehicle.host.email,
        phone: booking.vehicle.host.phoneNumber || 'N/A',
        address: 'Address on file', // TODO: Add host address field
        idNumber: 'ID on file' // TODO: Add host ID field
      },
      renter: {
        name: `${booking.user.profile?.firstName || ''} ${booking.user.profile?.lastName || ''}`.trim() || booking.user.email,
        email: booking.user.email,
        phone: booking.user.phoneNumber || 'N/A',
        address: 'Address on file', // TODO: Add renter address field
        licenseNumber: 'License on file', // TODO: Add from documents
        idNumber: 'ID on file' // TODO: Add from documents
      },
      vehicle: {
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
        plateNumber: booking.vehicle.plateNumber,
        vin: booking.vehicle.vin || 'N/A',
        color: booking.vehicle.color || 'N/A',
        mileage: booking.vehicle.currentMileage || 0
      },
      rental: {
        startDate: booking.startDate,
        endDate: booking.endDate,
        pickupLocation: booking.pickupLocation || 'To be arranged',
        dropoffLocation: booking.dropoffLocation || 'Same as pickup',
        dailyRate: booking.vehicle.dailyRate || 0,
        totalDays,
        totalAmount: booking.totalAmount,
        securityDeposit: booking.vehicle.securityDeposit || 0,
        platformFee: booking.serviceFee
      },
      terms: {
        mileageLimit: booking.vehicle.mileageAllowance || 200,
        fuelPolicy: booking.vehicle.fuelPolicy || 'Same to Same',
        lateReturnFee: 50, // TODO: Make configurable
        smokingAllowed: booking.vehicle.smokingAllowed || false,
        petsAllowed: booking.vehicle.petsAllowed || false,
        additionalDrivers: [] // TODO: Add additional drivers field
      }
    }

    // Generate HTML
    const html = generateRentalAgreementHTML(agreementData)

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })
    
    await browser.close()

    // Update agreement with generated PDF URL
    // TODO: Upload PDF to Supabase Storage and save URL

    // Return PDF as downloadable file
    return new NextResponse(Buffer.from(pdfBuffer), {
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
