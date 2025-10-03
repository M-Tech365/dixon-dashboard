import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip auth check for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // Get auth token from URL parameter or cookie
  const tokenFromUrl = searchParams.get('auth');
  const tokenFromCookie = request.cookies.get('auth-token')?.value;
  const validToken = process.env.DASHBOARD_AUTH_TOKEN;

  // If valid token in URL, set cookie and redirect to clean URL
  if (tokenFromUrl && tokenFromUrl === validToken) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Set long-lived cookie (1 year)
    response.cookies.set('auth-token', tokenFromUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/'
    });

    return response;
  }

  // Check if user is authenticated via cookie
  if (tokenFromCookie === validToken) {
    return NextResponse.next();
  }

  // Redirect to login page if not authenticated
  if (pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

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
};
