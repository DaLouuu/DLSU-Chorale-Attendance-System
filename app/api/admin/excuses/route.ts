import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { sendNotification } from "@/lib/notifications"
import type { ExcuseStatus } from "@/types/database.types"

// GET /api/admin/excuses?section=soprano&status=Pending,Approved,Rejected
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const section = searchParams.get("section")
  const statusParam = searchParams.get("status")

  const supabase = await createClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json({ error: "Unauthorized - no session" }, { status: 401 })
  }

  const { data: adminData, error: adminError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (adminError || !adminData || adminData.role !== "Executive Board") {
    return NextResponse.json({ error: "Forbidden - not an admin" }, { status: 403 })
  }

  let query = supabase
    .from("excuse_requests")
    .select(
      `
      *,
      profiles ( 
        full_name,
        section,
        school_id 
      )
    `
    )

  // Handle multiple statuses
  if (statusParam) {
    const statuses = statusParam.split(',')
    if (statuses.length === 1) {
      query = query.eq("status", statuses[0] as ExcuseStatus)
    } else {
      query = query.in("status", statuses as ExcuseStatus[])
    }
  } else {
    // Default to pending if no status specified
    query = query.eq("status", "Pending" as ExcuseStatus)
  }

  if (section) {
    // Filter by section from the joined profiles table
    query = query.eq('profiles.section', section)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching excuse requests:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // If section filter was applied and didn't work server-side, filter here:
  const filteredData = section ? data?.filter((item: { profiles?: { section?: string } }) => item.profiles?.section === section) : data

  return NextResponse.json(filteredData)
}

// PATCH /api/admin/excuses/:requestId
export async function PATCH(request: Request, { params }: { params: { requestId: string } }) {
  const requestId = parseInt(params.requestId)
  const requestBody = await request.json()
  const status = requestBody.status as ExcuseStatus
  const adminNotes = requestBody.adminNotes as string | undefined

  if (!["Approved", "Rejected", "Pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json({ error: "Unauthorized - no session" }, { status: 401 })
  }

  const { data: adminData, error: adminError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (adminError || !adminData || adminData.role !== "Executive Board") {
    return NextResponse.json({ error: "Forbidden - not an admin" }, { status: 403 })
  }

  // Get the excuse request with profile information
  const { data: excuseRequest, error: excuseRequestError } = await supabase
    .from("excuse_requests")
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .eq("request_id", requestId)
    .single()

  if (excuseRequestError || !excuseRequest) {
    console.error("Error fetching excuse request:", excuseRequestError)
    return NextResponse.json({ error: "Excuse request not found." }, { status: 404 })
  }

  const studentName = excuseRequest.profiles?.full_name
  const studentEmail = excuseRequest.profiles?.email

  // Update the excuse request
  const { data: updatedExcuse, error: updateError } = await supabase
    .from("excuse_requests")
    .update({
      status: status,
      admin_notes: adminNotes,
      admin_id_fk: session.user.id,
    })
    .eq("request_id", requestId)
    .select()
    .single()

  if (updateError) {
    console.error("Error updating excuse request:", updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }
  
  if (!updatedExcuse) {
    return NextResponse.json({ error: "No excuse request found to update." }, { status: 404 })
  }

  if (studentEmail && studentName) {
    try {
      await sendNotification({
        type: status === "Approved" ? "excuse_approved" : status === "Rejected" ? "excuse_rejected" : "excuse_pending",
        recipientEmail: studentEmail,
        recipientName: studentName,
        details: {
          date: updatedExcuse.request_date,
          notes: adminNotes,
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
