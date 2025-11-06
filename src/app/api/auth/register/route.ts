import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { hashPassword, generateTokens, generateOTP, sendSMS, checkRateLimit } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(identifier, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { phoneNumber: validatedData.phoneNumber }
        ]
      }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone number already exists' },
        { status: 409 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Generate OTP
    const otpCode = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        phoneNumber: validatedData.phoneNumber,
        otpCode,
        otpExpiry,
        profile: {
          create: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
          }
        }
      },
      include: {
        profile: true
      }
    })
    
    // Send OTP SMS
    try {
      await sendSMS(
        validatedData.phoneNumber,
        `Your ZEMO verification code is: ${otpCode}. Valid for 10 minutes.`
      )
    } catch (error) {
      console.error('Failed to send SMS:', error)
      // Don't fail registration if SMS fails in development
      if (process.env.NODE_ENV === 'production') {
        await prisma.user.delete({ where: { id: user.id } })
        return NextResponse.json(
          { error: 'Failed to send verification SMS' },
          { status: 500 }
        )
      }
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email
    })
    
    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    })
    
    return NextResponse.json({
      message: 'Registration successful. Please verify your phone number.',
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        profile: user.profile
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      )
    }
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}