import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes (landing page and auth pages)
  const publicRoutes = ['/', '/sign-in', '/sign-up'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check for session cookie or demo mode cookie for protected routes
  // Note: Actual auth verification happens in API routes and components
  // This is just a basic check to prevent obvious unauthorized access
  const sessionCookie = request.cookies.get('appwrite-session');
  const demoModeCookie = request.cookies.get('demo-mode');
  
  // Allow access if user has session OR is in demo mode
  const isAuthenticated = !!sessionCookie || demoModeCookie?.value === 'true';
  
  // If no session and not in demo mode, and trying to access protected route, redirect to landing page
  if (!isAuthenticated && !publicRoutes.includes(pathname) && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons).*)'],
};

