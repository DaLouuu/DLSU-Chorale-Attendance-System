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
        .eq("email", session.user.email)
        .single()

      if (directoryError || !directoryData) {
        // Email not in directory, redirect to unauthorized page
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }

      // Check if user already exists in Users table
      const { data: existingUser } = await supabase.from("Users").select("*").eq("id", session.user.id).single()

      if (!existingUser) {
        // Send welcome email
        try {
          await resend.emails.send({
            from: "DLSU Chorale <noreply@dlsuchorale.com>",
            to: session.user.email,
            subject: "Welcome to DLSU Chorale Attendance System",
            text: `
              Dear ${session.user.user_metadata.full_name || session.user.user_metadata.name || "Member"},
              
              Welcome to the DLSU Chorale Attendance System! Your registration is being processed.
              
              Your account will need to be verified by an administrator before you can access all features.
              You will receive another email once your account has been verified.
              
              Best regards,
              DLSU Chorale Admin Team
            `,
          })
        } catch (error) {
          console.error("Failed to send welcome email:", error)
        }
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/auth/setup", request.url))
}
