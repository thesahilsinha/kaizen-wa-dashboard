import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('ka_session')?.value

  if (pathname.startsWith('/login')) return NextResponse.next()

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(sessionCookie))

    if (pathname.startsWith('/admin') && parsed.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname.startsWith('/dashboard') && parsed.role !== 'client') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login']
}