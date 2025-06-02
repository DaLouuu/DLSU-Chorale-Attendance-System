import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/database.types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      // Check if user exists in Directory
      const { data: directoryData, error: directoryError } = await supabase
        .from("Directory")
        .select("id")
        .eq("email", session.user.email!) // Assuming email must exist
        .single()

      if (directoryError || !directoryData) {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }

      // Check if user exists in Accounts table using auth_user_id
      const { data: accountData, error: accountError } = await supabase
        .from("Accounts")
        .select("user_type") // Only select what's needed for redirection
        .eq("auth_user_id", session.user.id)
        .single()

      if (accountError || !accountData) {
        // User account doesn't exist in Accounts table, or error fetching
        // This could mean they registered but setup didn't complete, or they never registered.
        // Redirecting to /register allows them to start over or complete setup if /auth/setup handles existing Directory entries.
        return NextResponse.redirect(new URL("/register", request.url))
      }

      // User account exists, redirect based on user_type
      if (accountData.user_type === "admin") {
        return NextResponse.redirect(new URL("/admin/attendance-overview", request.url))
      } else {
        return NextResponse.redirect(new URL("/attendance-form", request.url)) // Default member page
      }
    }
  }

  // Fallback redirect
  return NextResponse.redirect(new URL("/login", request.url))
}
