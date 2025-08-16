import { createClient } from "@/utils/supabase/server"
import type { Database } from "@/types/database.types"

// PROFILES (formerly ACCOUNTS)
export async function getProfileByAuthUserId(authUserId: string) {
  const supabase = await createClient();
  return supabase.from("profiles").select("*").eq("auth_user_id", authUserId).single();
}

export async function getProfileById(profileId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getProfileById:", error)
    return null
  }
}

export async function getProfileByEmail(email: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single()

    if (error) {
      console.error("Error fetching profile by email:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getProfileByEmail:", error)
    return null
  }
}

export async function getProfileBySchoolId(schoolId: number) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("school_id", schoolId)
      .single()

    if (error) {
      console.error("Error fetching profile by school ID:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getProfileBySchoolId:", error)
    return null
  }
}

export async function createProfile(profile: Database["public"]["Tables"]["profiles"]["Insert"]) {
  const supabase = await createClient();
  return supabase.from("profiles").insert([profile]);
}

export async function updateProfile(id: string, updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>) {
  const supabase = await createClient()
  return supabase.from("profiles").update(updates).eq("id", id)
}

export async function deleteProfile(id: string) {
  const supabase = await createClient()
  return supabase.from("profiles").delete().eq("id", id)
}

// ATTENDANCE LOGS
export async function getAttendanceLogsByUser(userID: string) {
  const supabase = await createClient()
  return supabase.from("attendance_logs").select("*").eq("profile_id_fk", userID)
}

export async function getAttendanceLogsByProfileId(profileId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("profile_id_fk", profileId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching attendance logs:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAttendanceLogsByProfileId:", error)
    return []
  }
}

export async function createAttendanceLog(
  log: Database["public"]["Tables"]["attendance_logs"]["Insert"],
) {
  const supabase = await createClient();
  return supabase.from("attendance_logs").insert([log]);
}

export async function updateAttendanceLog(
  logID: number,
  updates: Partial<Database["public"]["Tables"]["attendance_logs"]["Update"]>,
) {
  const supabase = await createClient()
  return supabase.from("attendance_logs").update(updates).eq("log_id", logID)
}

export async function deleteAttendanceLog(logID: number) {
  const supabase = await createClient()
  return supabase.from("attendance_logs").delete().eq("log_id", logID)
}

// EXCUSE REQUESTS
export async function getExcuseRequestsByUser(userID: string) {
  const supabase = await createClient()
  return supabase.from("excuse_requests").select("*").eq("profile_id_fk", userID)
}

export async function getExcuseRequestsByProfileId(profileId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("excuse_requests")
      .select("*")
      .eq("profile_id_fk", profileId)
      .order("request_date", { ascending: false })

    if (error) {
      console.error("Error fetching excuse requests:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getExcuseRequestsByProfileId:", error)
    return []
  }
}

export async function createExcuseRequest(
  request: Database["public"]["Tables"]["excuse_requests"]["Insert"],
) {
  const supabase = await createClient();
  return supabase.from("excuse_requests").insert([request]);
}

export async function updateExcuseRequest(
  requestID: number,
  updates: Partial<Database["public"]["Tables"]["excuse_requests"]["Update"]>,
) {
  const supabase = await createClient()
  return supabase.from("excuse_requests").update(updates).eq("request_id", requestID)
}

export async function deleteExcuseRequest(requestID: number) {
  const supabase = await createClient()
  return supabase.from("excuse_requests").delete().eq("request_id", requestID)
}

// REHEARSALS
export async function getRehearsals() {
  const supabase = await createClient()
  return supabase.from("rehearsals").select("*").order("reh_date", { ascending: false })
}

export async function getRehearsalById(rehearsalID: number) {
  const supabase = await createClient()
  return supabase.from("rehearsals").select("*").eq("reh_id", rehearsalID).single()
}

export async function getRehearsalsByDate(date: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("rehearsals")
      .select("*")
      .eq("reh_date", date)
      .order("reh_time", { ascending: true })

    if (error) {
      console.error("Error fetching rehearsals by date:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getRehearsalsByDate:", error)
    return []
  }
}

export async function createRehearsal(
  rehearsal: Database["public"]["Tables"]["rehearsals"]["Insert"],
) {
  const supabase = await createClient();
  return supabase.from("rehearsals").insert([rehearsal]);
}

export async function updateRehearsal(
  rehearsalID: number,
  updates: Partial<Database["public"]["Tables"]["rehearsals"]["Update"]>,
) {
  const supabase = await createClient()
  return supabase.from("rehearsals").update(updates).eq("reh_id", rehearsalID)
}

export async function deleteRehearsal(rehearsalID: number) {
  const supabase = await createClient()
  return supabase.from("rehearsals").delete().eq("reh_id", rehearsalID)
}

// DIRECTORY (keeping for backward compatibility if needed)
export async function getDirectoryEntryByEmail(email: string) {
  const supabase = await createClient();
  return supabase.from("directory").select("*").eq("email", email).single();
}

export async function getDirectoryBySchoolId(schoolId: number) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("directory")
      .select("*")
      .eq("school_id", schoolId)
      .single()

    if (error) {
      console.error("Error fetching directory entry:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getDirectoryBySchoolId:", error)
    return null
  }
}

export async function createDirectoryEntry(entry: { school_id: number; email: string; full_name: string }) {
  const supabase = await createClient()
  return supabase.from("directory").insert(entry)
}

export async function updateDirectoryEntry(
  id: number,
  updates: Partial<{ school_id: number; email: string; full_name: string }>,
) {
  const supabase = await createClient()
  return supabase.from("directory").update(updates).eq("id", id)
}

export async function deleteDirectoryEntry(id: number) {
  const supabase = await createClient()
  return supabase.from("directory").delete().eq("id", id)
}
