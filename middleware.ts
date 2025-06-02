import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware' // Video's session refresher
import { createClient } from '@/utils/supabase/server' // For DB checks
import type { Database } from "@/types/database.types"

export async function middleware(request: NextRequest) {
  // First, refresh the session cookie by calling updateSession.
  // updateSession will return a response object with updated cookies.
  let response = await updateSession(request)

  // Create a Supabase client that can read the potentially updated cookies from the request object
  // that updateSession might have modified (though updateSession itself modifies the response cookies primarily).
  // For server-side client in middleware, it's often best to pass request/response explicitly if the client factory supports it.
  // The createClient from @/utils/supabase/server uses cookies() from next/headers, which reads from the incoming request.
  const supabase = createClient() 

  // Get session data. After updateSession, this should reflect the latest state.
  const { data: { session } } = await supabase.auth.getSession()

  // --- Your existing protection logic adapted ---
  const publicRoutes = ["/login", "/register", "/unauthorized"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  const authRoutes = ["/auth"] // Includes /auth/setup, /auth/callback, etc.
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (!session && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && !isPublicRoute && !isAuthRoute) {
    const { data: accountData, error: accountError } = await supabase
      .from("Accounts")
      .select("user_type, id") 
      .eq("auth_user_id", session.user.id)
      .single()

    if (!accountData) {
      // If accountData is null and there was no error, it means the account doesn't exist.
      // For any other error, it might be a DB issue.
      if (request.nextUrl.pathname !== "/auth/setup") { 
        // Redirect to setup if account not found, to complete profile.
        return NextResponse.redirect(new URL("/auth/setup", request.url))
      }
    } else if (accountData) {
      // Role-based access control for admin routes
      const path = request.nextUrl.pathname
      if (path.startsWith("/admin") && accountData.user_type !== "admin") {
        return NextResponse.redirect(new URL("/", request.url)) 
      }
    }
    // If accountError and not a "resource not found" type error, potentially handle differently or log
    if (accountError && accountError.code !== 'PGRST116') { // PGRST116 is row not found
        console.error("Middleware: Error fetching account data:", accountError);
        // Decide on a fallback, maybe redirect to an error page or login
        // return NextResponse.redirect(new URL("/error", request.url)); 
    }
  }
  // --- End of your adapted logic ---

  return response // Return the response from updateSession (which includes updated cookies)
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