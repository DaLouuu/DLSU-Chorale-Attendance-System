import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/database.types"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  const publicRoutes = ["/login", "/register", "/unauthorized"]
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  const authRoutes = ["/auth"] // Covers /auth/setup, /auth/callback-login etc.
  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // If user is not authenticated and trying to access a protected route (not public, not auth process)
  if (!session && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // If user is authenticated, perform checks for non-public and non-auth routes
  if (session && !isPublicRoute && !isAuthRoute) {
    // Check if user exists in Directory table
    const { data: directoryData, error: directoryQueryError } = await supabase
      .from("Directory")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (directoryQueryError && directoryQueryError.code !== 'PGRST116') {
      console.error('Middleware: Error querying Directory:', directoryQueryError);
      // Potentially redirect to an error page or allow access but log, depending on desired strictness
    }

    if (!directoryData) {
      // If user's email is not in directory, sign out and redirect to unauthorized
      // unless they are already on the unauthorized page.
      if (req.nextUrl.pathname !== "/unauthorized") {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // If email is in Directory, check Users table
    if (directoryData) {
      const { data: userData, error: userQueryError } = await supabase
        .from("Users")
        .select("id, is_admin") // Only fetch what's needed for routing
        .eq("id", session.user.id)
        .single()

      if (userQueryError && userQueryError.code !== 'PGRST116') {
        console.error('Middleware: Error querying Users table:', userQueryError);
        // Similar error handling decision as above
      }

      if (!userData) {
        // User in Directory but not in Users table, should be handled by /auth/setup.
        // If they try to access other protected routes, redirect to setup.
        if (req.nextUrl.pathname !== "/auth/setup") { // Allow access to /auth/setup itself
          return NextResponse.redirect(new URL("/auth/setup", req.url))
        }
      }

      // Role-based access control for admin routes if userData exists
      if (userData) {
        const path = req.nextUrl.pathname
        if (path.startsWith("/admin") && !userData.is_admin) {
          return NextResponse.redirect(new URL("/", req.url)) // Redirect non-admins from /admin
        }
      }
    }
  }
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
