import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'empanada';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/register'];
    const protectedRoutes = ['/dashboard', '/charts', '/deletedParcelas'];

    // Redirect to dashboard if logged in user tries to access public routes
    if (token && publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect to login if trying to access protected route without token
    if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Verify token for protected routes
    if (token && protectedRoutes.some(route => pathname.startsWith(route))) {
        try {
            jwt.verify(token, JWT_SECRET);
        } catch (error) {
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('token');
            return response;
        }
    }

    return NextResponse.next();
}