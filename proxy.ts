import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Role-to-Dashboard mapping
 */
const roleDashboardMap: Record<string, string> = {
  admin: "/admin/dashboard",
  salesman: "/salesman/dashboard",
  supervisor: "/supervisor/dashboard",
  buyer: "/customers/catalog/products",
};

/**
 * Role-to-Route Prefix mapping
 */
const roleRouteMap: Record<string, string> = {
  admin: "/admin",
  salesman: "/salesman",
  supervisor: "/supervisor",
  buyer: "/customers",
};

const publicRoutes = ["/login", "/signup", "/auth"];

async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            } catch (error) {
              console.error("Proxy cookie error:", error)
            }
          },
        },
      }
    )

    // This will refresh session if expired - vital for Vercel deployment
    const { data: { user } } = await supabase.auth.getUser()
    const { pathname } = request.nextUrl

    // 1. Skip static assets, favicon, and images
    if (
      pathname.includes('.') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api')
    ) {
      return response
    }

    const isPublic = publicRoutes.some((r) => pathname.startsWith(r))
    const userRole = user?.user_metadata?.role as string | undefined

    // 2. Handle Root Path
    if (pathname === "/") {
      if (user && userRole && roleDashboardMap[userRole]) {
        return NextResponse.redirect(new URL(roleDashboardMap[userRole], request.url))
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // 3. Handle Public Routes (Already logged in? Redirect to dashboard)
    if (isPublic) {
      if (user && (pathname === "/login" || pathname === "/signup")) {
        if (userRole && roleDashboardMap[userRole]) {
          return NextResponse.redirect(new URL(roleDashboardMap[userRole], request.url))
        }
      }
      return response
    }

    // 4. Protect Private Routes (No user? Redirect to login)
    if (!user) {
      const searchParams = new URLSearchParams(request.nextUrl.search)
      if (pathname !== '/login') {
        searchParams.set('next', pathname)
      }
      return NextResponse.redirect(new URL(`/login?${searchParams.toString()}`, request.url))
    }

    // 5. Enforce Role-Based Access
    const isStakeholderRoute = Object.values(roleRouteMap).some((prefix) =>
      pathname.startsWith(prefix)
    )

    if (isStakeholderRoute) {
      const allowedPrefix = userRole ? roleRouteMap[userRole] : null
      
      // Check if user is on a route they aren't allowed to be on
      if (!allowedPrefix || !pathname.startsWith(allowedPrefix)) {
        // Wrong role for this route -> redirect to their own dashboard
        const redirectUrl = (userRole && roleDashboardMap[userRole]) 
          ? roleDashboardMap[userRole] 
          : "/login";
        
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }

    return response;
  } catch (err) {
    console.error("Proxy error (503 prevention):", err);
    // If Supabase crashes, default strategy is to allow static & public routes, restrict private.
    const { pathname } = request.nextUrl;
    if (
      pathname.includes('.') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      publicRoutes.some((r) => pathname.startsWith(r))
    ) {
      return response;
    }
    
    // Fallback: Redirect to root/login to prevent a hard 503 HTTP status.
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - file extensions (svg, png, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
