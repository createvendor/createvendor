import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Global in-memory cache to skip expensive API lookups on edge repeated requests!
const domainCache = new Map<string, string>();

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Define your main domains
  const mainDomains = [
    'createvendor.shop',
    'createvendor.com',
    'localhost:3000',
    'localhost:3001',
    '127.0.0.1:3000',
  ];

  const isMainDomain = mainDomains.some(domain => hostname.includes(domain));

  // If it's a main domain, skip the lookup
  if (isMainDomain || hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  // Handle custom domain or subdomain instantly via cache
  if (domainCache.has(hostname)) {
    const cachedStoreId = domainCache.get(hostname);
    if (cachedStoreId) {
        return NextResponse.rewrite(new URL(`/store/${cachedStoreId}${url.pathname}${url.search}`, request.url));
    }
    return NextResponse.next();
  }

  try {
    const lookupRes = await fetch(`${url.origin}/api/domain/lookup?hostname=${hostname}`, {
      // @ts-ignore
      signal: AbortSignal.timeout?.(2500)
    });
    
    if (lookupRes.ok) {
        const { storeId } = await lookupRes.json();
        if (storeId) {
            domainCache.set(hostname, storeId); // Save for 0ms transitions later!
            return NextResponse.rewrite(new URL(`/store/${storeId}${url.pathname}${url.search}`, request.url));
        } else {
            domainCache.set(hostname, ''); // Cache failure
        }
    }
  } catch (err) {
    // Graceful degradation: If lookup fails or aborts, just continue as normal
  }

  return NextResponse.next();
}

// Config to limit middleware to specific paths
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
