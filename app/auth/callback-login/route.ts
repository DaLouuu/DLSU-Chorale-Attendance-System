import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
// import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code) // Store error for checking

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError)
      // Redirect to login with an error message or a generic error page
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url))
    }

    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      // Check if user email exists in Directory (assuming email must exist)
      // For now, we'll proceed as if this check passes or is handled later, per user instruction.
      // const { data: directoryData, error: directoryError } = await supabase
      //   .from("directory")
      //   .select("id")
      //   .eq("email", session.user.email!)
      //   .single()

      // if (directoryError || !directoryData) {
      //   return NextResponse.redirect(new URL("/unauthorized", request.url))
      // }

      // Check if user exists in Accounts table using auth_user_id
      const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("user_type") 
        .eq("auth_user_id", session.user.id)
        .single()

      if (accountError && accountError.code !== 'PGRST116') { // PGRST116 means no rows found, which is not an unexpected DB error here
        console.error("Database error fetching account:", accountError)
        // Consider redirecting to a generic error page or login with error
        return NextResponse.redirect(new URL("/login?error=db_error", request.url))
      }

      if (!accountData) {
        // User account doesn't exist in Accounts table, but auth user exists and is in Directory (implicitly, for now).
        // Redirect to /auth/setup to complete profile creation.
        return NextResponse.redirect(new URL("/auth/setup", request.url))
      }

      // User account exists, redirect based on user_type
      if (accountData.user_type === "admin") {
        return NextResponse.redirect(new URL("/admin/attendance-overview", request.url))
      } else {
        return NextResponse.redirect(new URL("/attendance-form", request.url)) // Default member page
      }
    }
  }

  // Fallback redirect if no code, or session not established after code exchange
  return NextResponse.redirect(new URL("/login", request.url))
}
