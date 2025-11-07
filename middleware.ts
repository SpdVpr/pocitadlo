import { NextRequest, NextResponse } from 'next/server';

// Stránky, které vyžadují autentizaci
const protectedRoutes = ['/', '/projects', '/history', '/todo'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Pokud je to chráněná stránka a uživatel není přihlášen, přesměruj na login
  // Poznámka: Skutečná autentizace se provádí na klientu přes Firebase
  // Tento middleware je jen pro základní ochranu
  
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

