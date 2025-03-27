// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from './app/lib/supabase';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session from cookies
  const session = request.cookies.get('sb-access-token')?.value;

  // Public routes
  const publicRoutes = ['/', '/register', '/dashboard', '/charts', 'deletedParcelas'];
  const protectedRoutes = ['/cesar'];

  // Redirect to dashboard if logged in user tries to access public routes
  if (session && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to login if trying to access protected route without session
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}