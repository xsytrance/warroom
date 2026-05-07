import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'war-room-secret-key-change-in-production');
const SESSION_COOKIE = 'warroom-session';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/health'];
const AGENT_PATHS = ['/api/agent/'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    pathname === '/' ||
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/api/auth/')) ||
    AGENT_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/sounds/') ||
    pathname.startsWith('/avatars/') ||
    pathname.startsWith('/uploads/') ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check for session token
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, SECRET, { clockTolerance: 60 });
    return NextResponse.next();
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/|sounds/|avatars/|uploads/).*)'],
};
