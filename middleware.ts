import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  let response = await updateSession(request)

  const supabase = await createClient();

  const { data: { user }, error: userAuthError } = await supabase.auth.getUser()

  if (userAuthError) {
    return response; 
  }

  const publicRoutes = ["/login", "/unauthorized"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  const authRoutes = ["/auth"] // Includes /auth/setup, /auth/callback, etc.
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // If no user, and not a public or auth route, redirect to login
  if (!user && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If there IS a user, and the route is NOT public AND NOT an auth route, 
  // then we need to check account status for protected routes.
  if (user && !isPublicRoute && !isAuthRoute) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role, id")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      // Database error occurred
    } else if (!profileData && request.nextUrl.pathname !== "/auth/setup") {
      // NO profileData (could be PGRST116 or genuinely null after no error)
      // AND we are NOT already trying to go to /auth/setup
      return NextResponse.redirect(new URL("/auth/setup?from=middleware_no_profile", request.url))
    } else if (profileData) {
      const path = request.nextUrl.pathname
      if (path.startsWith("/admin") && profileData.role !== "Executive Board") {
        return NextResponse.redirect(new URL("/manage-paalams", request.url)) 
      }
    }
  }

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