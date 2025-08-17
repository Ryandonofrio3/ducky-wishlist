import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  // Allow access to login page and API login route
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/api/auth/login')) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token
  const user = await verifyToken(token)
  
  if (!user || !user.isAuthenticated) {
    // Redirect to login if token is invalid
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/login (login API)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth/login|login|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
} 