import { NextRequest, NextResponse } from 'next/server'
import { verifyOtpSchema } from '@/lib/validations'
import { checkRateLimit } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(identifier, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = verifyOtpSchema.parse(body)
    
    // Find user by phone number
    const user = await prisma.user.findFirst({
      where: { phoneNumber: validatedData.phoneNumber }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if already verified
    if (user.phoneVerified) {
      return NextResponse.json(
        { message: 'Phone number already verified' }
      )
    }
    
    // Check OTP validity
    if (!user.otpCode || !user.otpExpiry) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one.' },
        { status: 400 }
      )
    }
    
    if (new Date() > user.otpExpiry) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }
    
    if (user.otpCode !== validatedData.otpCode) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      )
    }
    
    // Mark phone as verified and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        otpCode: null,
        otpExpiry: null
      }
    })
    
    return NextResponse.json({
      message: 'Phone number verified successfully',
      phoneVerified: true
    })
    
  } catch (error) {
    console.error('Phone verification error:', error)
    
    if (error instanceof Error && error.message.includes('Validation')) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}