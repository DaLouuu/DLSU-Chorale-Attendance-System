import { NextRequest, NextResponse } from "next/server"
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

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("[Callback] Error getting user:", userError)
      redirectTo = "/login?error=user_failed_callback"
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    if (user && user.email) {
      console.log("[Callback] User retrieved for email:", user.email)
      
      // Check if user exists in Profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single()
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("[Callback] Profiles check database error:", profileError)
        redirectTo = "/login?error=profiles_check_failed_callback"
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }

      if (existingProfile) {
        console.log("[Callback] Profile exists for user:", user.id, "Role:", existingProfile.role)
        // Profile exists, redirect to appropriate dashboard
        if (existingProfile.role === "Executive Board") {
          redirectTo = "/admin/attendance-overview"
        } else {
          redirectTo = "/dashboard"
        }
      } else {
        // No profile found, redirect to setup
        console.log("[Callback] No profile found for user, redirecting to setup")
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
