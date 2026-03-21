import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

/**
 * Next.js Middleware for robust redirection and route protection.
 * 
 * Why use middleware:
 * 1. Edge-side execution: Redirects happen before the request reaches the server, saving resources.
 * 2. Route Protection: Can be used to protect entire directory groups (e.g., /admin, /dashboard).
 * 3. Unified Logic: One place to manage all redirect rules.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Middleware running for path:", pathname);

  // 1. Get the session cookie
  const sessionCookie = request.cookies.get("session")?.value;
  
  // 2. Define public routes that don't need a session
  const isPublicRoute = pathname === "/login" || pathname === "/signup";
  
  // 3. Root redirect logic
  if (pathname === "/") {
    // If no session, redirect to login
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // If session exists, let app/page.tsx handle role-based redirection
    // OR we could decrypt it here for even faster redirects
    try {
      const session = await decrypt(sessionCookie);
      if (session?.user?.role) {
        const role = session.user.role;
        switch (role) {
          case "admin":
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
          case "supervisor":
            return NextResponse.redirect(new URL("/supervisor/dashboard", request.url));
          case "salesman":
            return NextResponse.redirect(new URL("/salesman/dashboard", request.url));
          default:
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    } catch (e) {
      // If decryption fails, clear cookie and go to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  // 4. Protect private routes
  if (!isPublicRoute && !sessionCookie) {
     // Exclude static assets and public APIs
     if (!pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.includes('.')) {
        return NextResponse.redirect(new URL("/login", request.url));
     }
  }

  return NextResponse.next();
}

// Optional: Limit middleware to specific paths for better performance
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
