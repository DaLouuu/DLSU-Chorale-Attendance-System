import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/database.types"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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
      // Check if user email exists in Directory
      const { data: directoryData, error: directoryError } = await supabase
        .from("Directory")
        .select("id")
        .eq("email", session.user.email!)
        .single()

      if (directoryError || !directoryData) {
        // Email not in directory, redirect to unauthorized page
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }

      // Check if user already exists in Accounts table using auth_user_id
      const { data: existingAccount } = await supabase.from("Accounts").select("auth_user_id").eq("auth_user_id", session.user.id).single()

      if (!existingAccount) {
        // Send welcome email - updated content
        if (session.user.email) {
          try {
            await resend.emails.send({
              from: "DLSU Chorale <noreply@dlsuchorale.com>",
              to: session.user.email,
              subject: "Welcome to DLSU Chorale Attendance System",
              text: `
                Dear ${session.user.user_metadata.full_name || session.user.user_metadata.name || "Member"},
                
                Welcome to the DLSU Chorale Attendance System! Your registration is being processed.
                
                You can now proceed to set up your account.
                
                Best regards,
                DLSU Chorale Admin Team
              `,
            })
          } catch (error) {
            console.error("Failed to send welcome email:", error)
          }
        } else {
          console.error("Welcome email not sent: user email undefined in session.");
        }
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/auth/setup", request.url))
}
