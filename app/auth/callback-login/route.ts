import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/database.types"

export async function GET(request: NextRequest) {
  console.log("Full callback URL received by /auth/callback-login:", request.url); // Log the full incoming URL
  const requestUrl = new URL(request.url)
  console.log("Parsed requestUrl object for /auth/callback-login:", requestUrl.toString()); // Log the parsed URL object
  const code = requestUrl.searchParams.get("code")
  console.log("Extracted 'code' parameter from URL:", code); // Log the extracted code

  if (!code) {
    console.error("OAuth callback-login called without a code. Redirecting to /login?error=oauth_no_code.")
    return NextResponse.redirect(new URL("/login?error=oauth_no_code", request.url))
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  // Exchange the code for a session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    console.error("Error exchanging code for session:", exchangeError)
    return NextResponse.redirect(new URL(`/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`, request.url))
  }

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    console.error("Error getting session or no session:", sessionError)
    await supabase.auth.signOut() // Ensure user is signed out if session is problematic
    return NextResponse.redirect(new URL(`/login?error=session_error&message=${encodeURIComponent(sessionError?.message || 'No session')}`, request.url))
  }

  // 1. Check if user's email exists in Directory
  console.log(`Checking Directory for email: ${session.user.email}`);
  const { data: directoryEntry, error: directoryError } = await supabase
    .from("Directory")
    .select("id, name") // name might be useful for setup
    .eq("email", session.user.email)
    .single()

  if (directoryError && directoryError.code !== "PGRST116") { // PGRST116: "No rows found"
    console.error("Error querying Directory:", directoryError)
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL(`/login?error=directory_query_error&message=${encodeURIComponent(directoryError.message)}`, request.url))
  }

  if (!directoryEntry) {
    // Email not in Directory, redirect to unauthorized
    console.log(`Email ${session.user.email} not found in Directory. Redirecting to /unauthorized.`)
    await supabase.auth.signOut() // Sign out the user as they are not authorized
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }
  console.log(`Email ${session.user.email} FOUND in Directory. Entry:`, directoryEntry);


  // 2. Email is in Directory, now check Users table
  console.log(`Checking Users table for ID: ${session.user.id}`);
  const { data: userProfile, error: userProfileError } = await supabase
    .from("Users")
    .select("id, user_type") // Changed from is_admin to user_type
    .eq("id", session.user.id)
    .single()

  if (userProfileError && userProfileError.code !== "PGRST116") { // PGRST116: "No rows found"
    console.error("Error querying Users table:", userProfileError)
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL(`/login?error=users_query_error&message=${encodeURIComponent(userProfileError.message)}`, request.url))
  }

  if (!userProfile) {
    // User is in Directory but NOT in Users table -> Needs setup
    console.log(`User ID ${session.user.id} not found in Users table. Redirecting to /auth/setup.`);
    // Pass directory info to setup page if needed, perhaps via a short-lived cookie or rely on setup to re-fetch
    return NextResponse.redirect(new URL("/auth/setup", request.url))
  }

  // 3. User is in Directory AND Users table -> Logged in, redirect to dashboard
  console.log(`User ID ${session.user.id} FOUND in Users table. Profile:`, userProfile);
  const isAdmin = userProfile.user_type === 'admin'; // Determine admin status
  if (isAdmin) { // Use isAdmin variable
    return NextResponse.redirect(new URL("/admin/attendance-overview", request.url))
  } else {
    // Assuming non-admins go to /attendance-overview as per your previous setup
    return NextResponse.redirect(new URL("/attendance-overview", request.url))
  }
}
