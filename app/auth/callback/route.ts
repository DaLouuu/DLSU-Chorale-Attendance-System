import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  let redirectTo = "/dashboard" // Default redirect to dashboard

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("[Callback] Error exchanging code for session:", exchangeError)
      redirectTo = "/login?error=auth_failed_callback"
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("[Callback] Error getting session:", sessionError)
      redirectTo = "/login?error=session_failed_callback"
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    if (session && session.user && session.user.email) {
      console.log("[Callback] Session retrieved for email:", session.user.email)
      
      // Check if user exists in Accounts table
      const { data: existingAccount, error: accountError } = await supabase
        .from("accounts")
        .select("auth_user_id, user_type")
        .eq("auth_user_id", session.user.id)
        .single()
        
      if (accountError && accountError.code !== 'PGRST116') {
        console.error("[Callback] Accounts check database error:", accountError)
        redirectTo = "/login?error=accounts_check_failed_callback"
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }

      if (existingAccount) {
        console.log("[Callback] Account exists for user:", session.user.id, "Type:", existingAccount.user_type)
        // Account exists, redirect to appropriate dashboard
        if (existingAccount.user_type === "admin") {
          redirectTo = "/admin/attendance-overview"
        } else {
          redirectTo = "/dashboard"
        }
      } else {
        // No account found, redirect to setup
        console.log("[Callback] No account found for user, redirecting to setup")
        redirectTo = "/auth/setup"
      }
    } else {
      console.warn("[Callback] No session or session.user.email after code exchange.")
      redirectTo = "/login?error=no_session_after_code_exchange"
    }
  } else {
    console.warn("[Callback] No code found in request.")
    redirectTo = "/login?error=no_code_callback"
  }

  console.log("[Callback] Final redirect to:", redirectTo)
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
