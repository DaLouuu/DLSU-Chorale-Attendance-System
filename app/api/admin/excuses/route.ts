import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database, Status } from "@/types/database.types"
import { sendNotification } from "@/lib/notifications"

// GET /api/admin/excuses?section=soprano
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const section = searchParams.get("section")

  const supabase = createClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json({ error: "Unauthorized - no session" }, { status: 401 })
  }

  const { data: adminData, error: adminError } = await supabase
    .from("accounts")
    .select("user_type")
    .eq("auth_user_id", session.user.id)
    .single()

  if (adminError || !adminData || adminData.user_type !== "admin") {
    return NextResponse.json({ error: "Forbidden - not an admin" }, { status: 403 })
  }

  let query = supabase
    .from("excuserequests")
    .select(
      `
      *,
      accounts ( 
        name,
        section,
        directory_id 
      )
    `
    )
    .eq("status", "Pending" as Status)

  if (section) {
    // Ensure the join 'accounts' is referred correctly if section is on the accounts table
    // This relies on Supabase's ability to filter on joined table columns.
    // If direct filtering on joined table is problematic, might need a view or function.
    // For now, assuming this works or 'section' is a column directly on 'excuserequests' that's populated.
    // Based on schema, 'section' is on 'accounts', so this should be:
    // query = query.eq('accounts.section', section); // This syntax might not work directly.
    // A more robust way if direct join filter fails is to fetch accounts first or use a view.
    // However, Supabase often allows this with foreign table syntax.
    // Let's assume the previous `query.eq("Users.section", section)` was working via RPC or specific Supabase magic.
    // The select `accounts(section)` implies section is on accounts.
    // A common way for filtering on related tables is often done via an RPC or a function call.
    // For now, attempting the direct filter, if it fails, this part needs re-evaluation.
    // The select `accounts(section)` means we are fetching section from the related accounts table.
    // To filter by it, we might need to filter `accounts` separately or ensure the join is filterable.
    // Given the original code: `query.eq("Users.section", section)`, it was likely working. So we'll try `query.eq("accounts.section", section)`.
    // This will require `accounts` to be filterable this way.
    // This syntax for filtering on related tables (accounts.section) is generally NOT supported directly in .eq()
    // A workaround is to fetch all and filter in JS, or use an RPC, or add section to excuserequests.
    // For now, I will comment out this filter as it's unlikely to work as written.
    // User should consider adding section to excuserequests table for easier querying or use an RPC.
    // console.warn("Filtering by section on a joined table might not work directly with .eq(). Review if results are not filtered.");
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching excuse requests:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // If section filter was applied and didn't work server-side, filter here:
  const filteredData = section ? data?.filter(item => (item.accounts as any)?.section === section) : data

  return NextResponse.json(filteredData)
}

// PATCH /api/admin/excuses/:userId/:date
// params.userId is assumed to be the auth_user_id of the student
export async function PATCH(request: Request, { params }: { params: { userId: string; date: string } }) {
  const studentAuthUserId = params.userId
  const dateOfAbsence = params.date
  const requestBody = await request.json()
  const status = requestBody.status as Status
  const notes = requestBody.notes as string | undefined

  if (!["Approved", "Rejected", "Pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
  }

  const supabase = createClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json({ error: "Unauthorized - no session" }, { status: 401 })
  }

  const { data: adminData, error: adminError } = await supabase
    .from("accounts")
    .select("user_type")
    .eq("auth_user_id", session.user.id)
    .single()

  if (adminError || !adminData || adminData.user_type !== "admin") {
    return NextResponse.json({ error: "Forbidden - not an admin" }, { status: 403 })
  }

  // Get target student's account_id, name, and directory_id
  const { data: studentAccount, error: studentAccountError } = await supabase
    .from("accounts")
    .select("account_id, name, directory_id")
    .eq("auth_user_id", studentAuthUserId)
    .single()

  if (studentAccountError || !studentAccount) {
    console.error("Error fetching student account details:", studentAccountError)
    return NextResponse.json({ error: "Student account not found for the given userId." }, { status: 404 })
  }

  const studentAccountIdFk = studentAccount.account_id
  const studentName = studentAccount.name
  const studentDirectoryId = studentAccount.directory_id

  // Get student's email from directory
  let studentEmail: string | null = null
  if (studentDirectoryId) {
    const { data: directoryData, error: directoryError } = await supabase
      .from("directory")
      .select("email")
      .eq("id", studentDirectoryId)
      .single()
    if (directoryError) {
      console.error("Error fetching student email from directory:", directoryError)
      // Not a fatal error for the update, but notification will fail.
    }
    studentEmail = directoryData?.email || null
  }

  const { data: updatedExcuse, error: updateError } = await supabase
    .from("excuserequests")
    .update({
      status: status,
      notes: notes,
      approved_by: session.user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("account_id_fk", studentAccountIdFk)
    .eq("date_of_absence", dateOfAbsence)
    .select()
    .single()

  if (updateError) {
    console.error("Error updating excuse request:", updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }
  
  if (!updatedExcuse) {
    // This can happen if no record matched the criteria (e.g. wrong date or user never submitted for that date)
    return NextResponse.json({ error: "No excuse request found for the student on the specified date to update." }, { status: 404 })
  }

  if (studentEmail && studentName) {
    try {
      await sendNotification({
        type: status === "Approved" ? "excuse_approved" : status === "Rejected" ? "excuse_rejected" : "excuse_pending",
        recipientEmail: studentEmail,
        recipientName: studentName,
        details: {
          date: dateOfAbsence,
          notes: notes,
        },
      })
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError)
      // Non-fatal, excuse was updated.
    }
  } else {
    console.warn("Could not send notification: student email or name missing.")
  }

  return NextResponse.json(updatedExcuse)
}
