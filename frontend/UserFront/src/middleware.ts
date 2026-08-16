import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a mock middleware for role-based protection
// In a real app, you would verify the session/token and user role from your Auth provider
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const role = request.cookies.get('user-role')?.value

    // 1. If user is logged in, redirect away from auth and related pages
    const isAuthPage = pathname.startsWith('/auth') ||
        pathname.startsWith('/reset-password') ||
        pathname.startsWith('/verify-email')

    if (isAuthPage && role) {
        let dashboardPath = '/';
        if (role === 'instructor') dashboardPath = '/instructor/dashboard';
        else if (role === 'student') dashboardPath = '/student/dashboard';
        // Admin doesn't have a dashboard in userFront, so redirect to home or external adminFront

        return NextResponse.redirect(new URL(dashboardPath, request.url))
    }

    // 2. Protect role-based routes
    if (pathname.startsWith('/instructor')) {
        if (!role) {
            const loginUrl = new URL('/auth', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
        if (role !== 'instructor') {
            const redirectUrl = role === 'student' ? '/student/dashboard' : '/'
            return NextResponse.redirect(new URL(redirectUrl, request.url))
        }
    }

    if (pathname.startsWith('/student')) {
        if (!role) {
            const loginUrl = new URL('/auth', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
        if (role !== 'student') {
            const redirectUrl = role === 'instructor' ? '/instructor/dashboard' : '/'
            return NextResponse.redirect(new URL(redirectUrl, request.url))
        }
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/auth/:path*',
        '/reset-password/:path*',
        '/verify-email/:path*',
        '/instructor/:path*',
        '/student/:path*',
    ],
}
