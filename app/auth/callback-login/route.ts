import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
// import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("[CallbackLogin] Error exchanging code for session:", exchangeError)
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url))
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("[CallbackLogin] Error getting session:", sessionError)
      return NextResponse.redirect(new URL("/login?error=session_failed", request.url))
    }

    if (session) {
      // 1. Check Directory
      const { data: directoryData, error: directoryError } = await supabase
        .from("directory")
        .select("id") // We need directory.id for potential setup
        .eq("email", session.user.email!)
        .single()

      if (directoryError && directoryError.code !== 'PGRST116') {
        console.error("[CallbackLogin] Directory check database error:", directoryError)
        return NextResponse.redirect(new URL("/login?error=directory_check_failed", request.url))
      }

      if (!directoryData) {
        console.warn(`[CallbackLogin] Unauthorized OAuth login attempt: email ${session.user.email} not in Directory.`)
        // Consider signing them out if you want to be strict, as they authenticated but are not in the directory
        // await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/unauthorized?reason=email_not_in_directory", request.url))
      }
      console.log("[CallbackLogin] User email found in directory:", directoryData)

      // 2. Check Accounts
      const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("user_type, auth_user_id") // Select auth_user_id to confirm it is indeed this user's account
        .eq("auth_user_id", session.user.id)
        .single()

      if (accountError && accountError.code !== 'PGRST116') {
        console.error("[CallbackLogin] Accounts check database error:", accountError)
        return NextResponse.redirect(new URL("/login?error=accounts_check_failed", request.url))
      }

      if (accountData) {
        // User is in Directory AND Accounts, proceed to dashboard
        console.log("[CallbackLogin] User found in Accounts. User type:", accountData.user_type)
        if (accountData.user_type === "admin") {
          return NextResponse.redirect(new URL("/admin/attendance-overview", request.url))
        } else {
          return NextResponse.redirect(new URL("/attendance-form", request.url)) // Or your main member dashboard
        }
      } else {
        // User is in Directory BUT NOT in Accounts, needs setup
        // The /auth/setup page will use directoryData.id if needed (passed via session or re-fetched)
        console.log("[CallbackLogin] User in Directory but not Accounts. Redirecting to /auth/setup.")
        // No need to pass registrationData in localStorage here, as setup page handles fetching directory ID.
        return NextResponse.redirect(new URL("/auth/setup", request.url))
      }
    } else {
      console.warn("[CallbackLogin] No session after code exchange.")
      return NextResponse.redirect(new URL("/login?error=no_session", request.url))
    }
  }

  console.warn("[CallbackLogin] No code found in request URL.")
  return NextResponse.redirect(new URL("/login?error=no_code", request.url))
}
