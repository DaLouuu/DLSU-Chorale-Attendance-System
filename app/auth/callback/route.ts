import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
// import type { Database } from "@/types/database.types" // createClient from utils/supabase/server will have types
import { createClient } from "@/utils/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  let redirectTo = "/auth/setup" // Default redirect, will be changed if errors or other conditions met

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
      // 1. Check Directory FIRST
      const { data: directoryData, error: directoryError } = await supabase
        .from("directory")
        .select("id")
        .eq("email", session.user.email)
        .single()

      if (directoryError && directoryError.code !== 'PGRST116') {
        console.error("[Callback] Directory check database error:", directoryError)
        redirectTo = "/login?error=directory_check_failed_callback"
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }

      if (!directoryData) {
        console.warn(`[Callback] Unauthorized signup attempt: email ${session.user.email} not in Directory.`)
        // User's email is not in the directory. They should not proceed to setup.
        // Optionally sign them out to prevent access with an unverified-against-directory auth session.
        // await supabase.auth.signOut(); 
        redirectTo = "/unauthorized?reason=email_not_in_directory_signup"
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }
      console.log("[Callback] User email found in directory:", directoryData)

      // 2. Check if user ALREADY exists in Accounts table (e.g., if they somehow hit this callback again)
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
        console.log("[Callback] Account already exists for user:", session.user.id, "Type:", existingAccount.user_type)
        // Account already exists, redirect to appropriate dashboard
        if (existingAccount.user_type === "admin") {
          redirectTo = "/admin/attendance-overview"
        } else {
          redirectTo = "/attendance-form" 
        }
      } else {
        // User is in Directory, no existing account, proceed to setup. Send welcome email.
        console.log("[Callback] New user (in Directory, no Account). Sending welcome email and proceeding to setup for:", session.user.email)
        if (process.env.RESEND_API_KEY) { // Ensure Resend is configured
            try {
                await resend.emails.send({
                from: "DLSU Chorale <noreply@dlsuchorale.com>", // Update with your actual sender email if different
                to: session.user.email,
                subject: "Welcome to DLSU Chorale Attendance System!",
                text: `Dear ${session.user.user_metadata.full_name || session.user.user_metadata.name || "Member"},\n\nWelcome to the DLSU Chorale Attendance System! Your registration is confirmed.\n\nPlease proceed to set up your account details.\n\nBest regards,\nDLSU Chorale Admin Team`,
                });
                console.log("[Callback] Welcome email sent to:", session.user.email)
            } catch (emailError) {
                console.error("[Callback] Failed to send welcome email:", emailError)
            }
        } else {
            console.warn("[Callback] RESEND_API_KEY not set. Skipping welcome email.")
        }
        redirectTo = "/auth/setup" // This is the correct path for new, directory-verified users
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
