import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

// Role → allowed route prefix
const roleRouteMap: Record<string, string> = {
  admin: "/admin",
  salesman: "/salesman",
  supervisor: "/supervisor",
  buyer: "/customers",
};

// Role → default landing page after login
const roleDashboardMap: Record<string, string> = {
  admin: "/admin/dashboard",
  salesman: "/salesman/dashboard",
  supervisor: "/supervisor/dashboard",
  buyer: "/customers/catalog/products",
};

// Routes that don't require authentication
const publicPrefixes = ["/login", "/signup", "/auth"];

async function getSessionRole(request: NextRequest): Promise<string | null> {
  const session = request.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, key, { algorithms: ["HS256"] });
    return (payload as any).user?.role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals, static files, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|webp|woff2?|ttf|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  const isPublic = publicPrefixes.some((p) => pathname.startsWith(p));

  // ── Public routes ──
  if (isPublic) {
    // Logged-in users hitting /login or /signup → redirect to their dashboard
    if (pathname === "/login" || pathname === "/signup") {
      const role = await getSessionRole(request);
      if (role && roleDashboardMap[role]) {
        return NextResponse.redirect(
          new URL(roleDashboardMap[role], request.url)
        );
      }
    }
    return NextResponse.next();
  }

  // ── Root path ──
  if (pathname === "/") {
    const role = await getSessionRole(request);
    if (role && roleDashboardMap[role]) {
      return NextResponse.redirect(
        new URL(roleDashboardMap[role], request.url)
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Protected stakeholder routes ──
  const isProtected = Object.values(roleRouteMap).some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) {
    // Paths that don't match any stakeholder prefix → let Next handle (404, etc.)
    return NextResponse.next();
  }

  const role = await getSessionRole(request);

  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify the user's role matches the route prefix they're accessing
  const allowedPrefix = roleRouteMap[role];
  if (!allowedPrefix || !pathname.startsWith(allowedPrefix)) {
    // Wrong role for this route → send to their own dashboard
    return NextResponse.redirect(
      new URL(roleDashboardMap[role] || "/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets served by Next.js.
     * The middleware function itself also has early-return guards.
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};
