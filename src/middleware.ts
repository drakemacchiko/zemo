import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Edge-compatible JWT verification using jose library
async function verifyAccessToken(token: string): Promise<any | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies or Authorization header
  const cookieToken = request.cookies.get('accessToken')?.value
  const headerToken = request.headers.get('Authorization')?.replace('Bearer ', '')
  const token = cookieToken || headerToken

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/about', '/contact', '/privacy', '/terms']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if accessing admin routes
  const isAdminRoute = pathname.startsWith('/admin')
  
  // Check if accessing host routes
  const isHostRoute = pathname.startsWith('/host')

  // If no token and trying to access protected route, redirect to login
  if (!token && (isAdminRoute || isHostRoute || pathname.startsWith('/profile') || pathname.startsWith('/bookings') || pathname.startsWith('/messages'))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token and check role for admin/host routes
  if (token) {
    try {
      const decoded = await verifyAccessToken(token)
      
      if (!decoded) {
        // Invalid token, redirect to login
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
      }

      const userRole = decoded.role

      // Admin route protection
      if (isAdminRoute) {
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
          // Not an admin, redirect to home
          return NextResponse.redirect(new URL('/', request.url))
        }
      }

      // Redirect authenticated users from login/register to appropriate dashboard
      if (pathname === '/login' || pathname === '/register') {
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (userRole === 'HOST') {
          return NextResponse.redirect(new URL('/host', request.url))
        } else {
          return NextResponse.redirect(new URL('/profile', request.url))
        }
      }

      // Redirect from root to appropriate dashboard for authenticated users
      if (pathname === '/' && request.headers.get('referer')?.includes('/login')) {
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (userRole === 'HOST') {
          return NextResponse.redirect(new URL('/host', request.url))
        }
      }

    } catch (error) {
      // Token verification failed, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('accessToken')
      logDebug('Verification Error', (error as Error).message)
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
