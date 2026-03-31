import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

// 1. Specify protected and public routes
const protectedRoutes = ['/admin', '/salesman', '/catalog', '/inventory', '/dashboard'];
const publicRoutes = ['/login', '/signup', '/', '/auth/callback'];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = req.cookies.get('session')?.value;
  let session = null;
  if (cookie) {
    try {
      session = await decrypt(cookie);
    } catch (e) {
      console.error("Session decryption failed:", e);
    }
  }

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.user) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is authenticated and trying to access a public route
  if (
    isPublicRoute &&
    session?.user &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    // Redirect based on role if they end up on login while logged in
    if (session.user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl));
    }
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
