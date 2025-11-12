import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations'
import { verifyPassword, generateTokens, checkRateLimit } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(identifier, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        profile: true,
        drivingLicense: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
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
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        role: user.role,
        profile: user.profile,
        drivingLicense: user.drivingLicense
      },
      tokens: {
        accessToken,
        refreshToken
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    
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