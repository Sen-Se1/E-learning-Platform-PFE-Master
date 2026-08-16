import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a mock middleware for role-based protection
// In a real app, you would verify the session/token and user role from your Auth provider
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const role = request.cookies.get('admin-role')?.value

    // NOTE: Within middleware, pathname is RELATIVE to the basePath (/admin)
    // So for URL '/admin/dashboard', pathname is '/dashboard'
    // For URL '/admin/auth', pathname is '/auth'

    // 1. If user is logged in, redirect away from auth pages
    if (pathname.startsWith('/auth') && role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 2. Protect routes (everything except /auth should require admin role)
    if (!pathname.startsWith('/auth') && role !== 'admin') {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
