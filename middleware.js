import { NextResponse } from 'next/server';
import { applyCors } from '@/lib/http/cors';

export function middleware(request) {
  if (request.method === 'OPTIONS') {
    return applyCors(request, new NextResponse(null, { status: 204 }));
  }

  return applyCors(request, NextResponse.next());
}

export const config = {
  matcher: '/api/:path*'
};
