import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from './app/lib/supabase';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session from Supabase
  const { data: { session } } = await supabase.auth.getSession();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/register'];
  const protectedRoutes = ['/dashboard', '/charts', '/deletedParcelas'];

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