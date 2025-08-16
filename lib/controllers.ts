import { createClient } from "@/utils/supabase/server"
import type { Database } from "@/types/database.types"

// PROFILES (formerly ACCOUNTS)
export async function getProfileByAuthUserId(authUserId: string) {
  const supabase = await createClient();
  return supabase.from("profiles").select("*").eq("auth_user_id", authUserId).single();
}

export async function getProfileById(id: string) {
  const supabase = createClient()
  return supabase.from("profiles").select("*").eq("id", id).single()
}

export async function createProfile(profile: Database["public"]["Tables"]["profiles"]["Insert"]) {
  const supabase = await createClient();
  return supabase.from("profiles").insert([profile]);
}

export async function updateProfile(id: string, updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>) {
  const supabase = createClient()
  return supabase.from("profiles").update(updates).eq("id", id)
}

export async function deleteProfile(id: string) {
  const supabase = createClient()
  return supabase.from("profiles").delete().eq("id", id)
}

// ATTENDANCE LOGS
export async function getAttendanceLogsByUser(userID: string) {
  const supabase = createClient()
  return supabase.from("attendance_logs").select("*").eq("profile_id_fk", userID)
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
): Promise<any> {
  const supabase = createClient()
  return supabase.from("attendance_logs").update(updates).eq("log_id", logID)
}

export async function deleteAttendanceLog(logID: number) {
  const supabase = createClient()
  return supabase.from("attendance_logs").delete().eq("log_id", logID)
}

// EXCUSE REQUESTS
export async function getExcuseRequestsByUser(userID: string) {
  const supabase = createClient()
  return supabase.from("excuse_requests").select("*").eq("profile_id_fk", userID)
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
): Promise<any> {
  const supabase = createClient()
  return supabase.from("excuse_requests").update(updates).eq("request_id", requestID)
}

export async function deleteExcuseRequest(requestID: number) {
  const supabase = createClient()
  return supabase.from("excuse_requests").delete().eq("request_id", requestID)
}

// REHEARSALS
export async function getRehearsals() {
  const supabase = createClient()
  return supabase.from("rehearsals").select("*").order("reh_date", { ascending: false })
}

export async function getRehearsalById(rehearsalID: number) {
  const supabase = createClient()
  return supabase.from("rehearsals").select("*").eq("reh_id", rehearsalID).single()
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
): Promise<any> {
  const supabase = createClient()
  return supabase.from("rehearsals").update(updates).eq("reh_id", rehearsalID)
}

export async function deleteRehearsal(rehearsalID: number) {
  const supabase = createClient()
  return supabase.from("rehearsals").delete().eq("reh_id", rehearsalID)
}

// DIRECTORY (keeping for backward compatibility if needed)
export async function getDirectoryEntryByEmail(email: string) {
  const supabase = await createClient();
  return supabase.from("directory").select("*").eq("email", email).single();
}

export async function createDirectoryEntry(entry: Database["public"]["Tables"]["directory"]["Insert"]) {
  const supabase = await createClient();
  return supabase.from("directory").insert([entry]);
}

export async function updateDirectoryEntry(
  id: number,
  updates: Partial<Database["public"]["Tables"]["directory"]["Update"]>,
) {
  const supabase = createClient()
  return supabase.from("directory").update(updates).eq("id", id)
}

export async function deleteDirectoryEntry(id: number) {
  const supabase = createClient()
  return supabase.from("directory").delete().eq("id", id)
}
