import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Incoming request: ${request.method} ${request.nextUrl.pathname}`)

  let response = await updateSession(request)
  console.log("[Middleware] updateSession completed.")

  const supabase = await createClient();
  console.log("[Middleware] Supabase client created.")

  const { data: { session }, error: sessionAuthError } = await supabase.auth.getSession()

  if (sessionAuthError) {
    console.error("[Middleware] Error getting session:", sessionAuthError)
    return response; 
  }
  console.log("[Middleware] Session data retrieved. Session exists:", !!session)
  if (session) {
    console.log("[Middleware] Session user ID:", session.user.id, "Email:", session.user.email)
  }

  const publicRoutes = ["/login", "/unauthorized"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  console.log(`[Middleware] Is public route (${request.nextUrl.pathname}):`, isPublicRoute)

  const authRoutes = ["/auth"] // Includes /auth/setup, /auth/callback, etc.
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  console.log(`[Middleware] Is auth route (${request.nextUrl.pathname}):`, isAuthRoute)

  // If no session, and not a public or auth route, redirect to login
  if (!session && !isPublicRoute && !isAuthRoute) {
    console.log("[Middleware] No session, not public, not auth. Redirecting to /login.")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If there IS a session, and the route is NOT public AND NOT an auth route, 
  // then we need to check account status for protected routes.
  if (session && !isPublicRoute && !isAuthRoute) {
    console.log(`[Middleware] Session exists, not public, not auth. Checking account for path: ${request.nextUrl.pathname}`)
    console.log(`[Middleware] Querying 'accounts' for auth_user_id: ${session.user.id}`)
    const { data: accountData, error: accountError } = await supabase
      .from("accounts")
      .select("user_type, account_id")
      .eq("auth_user_id", session.user.id)
      .single()

    console.log("[Middleware] Account query result - data:", accountData, "error:", accountError)

    if (accountError && accountError.code !== 'PGRST116') {
      console.error("[Middleware] Database error fetching account (and not PGRST116):", accountError)
    } else if (!accountData && request.nextUrl.pathname !== "/auth/setup") {
      // NO accountData (could be PGRST116 or genuinely null after no error)
      // AND we are NOT already trying to go to /auth/setup
      console.warn("[Middleware] No account data found for user, and not on /auth/setup. Redirecting to /auth/setup.")
      return NextResponse.redirect(new URL("/auth/setup?from=middleware_no_account", request.url))
    } else if (accountData) {
      console.log("[Middleware] Account data found:", accountData)
      const path = request.nextUrl.pathname
      if (path.startsWith("/admin") && accountData.user_type !== "admin") {
        console.warn("[Middleware] Non-admin attempting to access admin route. Redirecting to / (dashboard or attendance-form).")
        return NextResponse.redirect(new URL("/attendance-form", request.url)) 
      }
      console.log("[Middleware] Account check passed. User type:", accountData.user_type)
    }
  }

  console.log(`[Middleware] Allowing request to proceed for: ${request.nextUrl.pathname}`)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
} 