import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight in-memory rate limiter (per-instance)
// For a production-ready global solution on Vercel, use @upstash/ratelimit
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 25; // Strict: Max 25 requests per minute per IP

const ALLOWED_ORIGINS = [
  'https://miruhindi.vercel.app',
  'https://amaitv.vercel.app',
  'http://localhost:3000'
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  // 1. CORS Enforcement for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Handle Preflight requests
    if (request.method === 'OPTIONS') {
      const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-uid, x-deep-sync',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 2. Rate Limiting Logic
    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const now = Date.now();
    
    let rateData = rateLimitMap.get(ip);
    
    if (!rateData || (now - rateData.lastReset) > RATE_LIMIT_WINDOW) {
      rateData = { count: 0, lastReset: now };
    }
    
    rateData.count++;
    rateLimitMap.set(ip, rateData);
    
    if (rateData.count > MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for IP: ${ip} on ${request.nextUrl.pathname}`);
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again in a minute.' }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((RATE_LIMIT_WINDOW - (now - rateData.lastReset)) / 1000).toString(),
            'X-XSS-Protection': '1; mode=block'
          } 
        }
      );
    }
  }

  const response = NextResponse.next();
  
  // Set CORS for successful API requests
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
    response.headers.set('Access-Control-Allow-Origin', isAllowed ? origin : ALLOWED_ORIGINS[0]);
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
