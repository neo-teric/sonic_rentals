import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Set pathname in header for layout to read
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  
  // Allow access to login page without authentication
  if (pathname === '/admin/login') {
    return response
  }
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const session = await auth()
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}

