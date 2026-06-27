import { NextResponse } from 'next/server';
import { applyCors } from '@/lib/http/cors';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/dashboard' || pathname === '/generate' || pathname === '/login' || pathname === '/signup') {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  if (request.method === 'OPTIONS') {
    return applyCors(request, new NextResponse(null, { status: 204 }));
  }

  return applyCors(request, NextResponse.next());
}

export const config = {
  matcher: ['/api/:path*', '/dashboard', '/generate', '/login', '/signup']
};
