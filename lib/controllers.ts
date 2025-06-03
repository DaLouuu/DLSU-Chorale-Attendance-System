import { createClient } from "@/utils/supabase/server"
import type { Database, Status, AttendanceLogMethod } from "@/types/database.types"

// ACCOUNTS (formerly USERS)
export async function getAccountByAuthUserId(authUserId: string) {
  const supabase = createClient()
  return supabase.from("accounts").select("*").eq("auth_user_id", authUserId).single()
}
export async function getAccountById(id: number) {
  const supabase = createClient()
  return supabase.from("accounts").select("*").eq("account_id", id).single()
}
export async function createAccount(account: Database["public"]["Tables"]["accounts"]["Insert"]) {
  const supabase = createClient()
  return supabase.from("accounts").insert([account])
}
export async function updateAccount(id: number, updates: Partial<Database["public"]["Tables"]["accounts"]["Update"]>) {
  const supabase = createClient()
  return supabase.from("accounts").update(updates).eq("account_id", id)
}
export async function deleteAccount(id: number) {
  const supabase = createClient()
  return supabase.from("accounts").delete().eq("account_id", id)
}

// ATTENDANCE LOGS
export async function getAttendanceLogsByUser(userID: number) {
  const supabase = createClient()
  return supabase.from("attendancelogs").select("*").eq("account_id_fk", userID)
}
export async function createAttendanceLog(
  log: Database["public"]["Tables"]["attendancelogs"]["Insert"],
) {
  const supabase = createClient()
  return supabase.from("attendancelogs").insert([log])
}
export async function updateAttendanceLog(
  userID: number,
  timestamp: string,
  updates: Partial<Database["public"]["Tables"]["attendancelogs"]["Update"]>,
): Promise<any> {
  const supabase = createClient()
  return supabase.from("attendancelogs").update(updates).eq("account_id_fk", userID).eq("timestamp", timestamp)
}
export async function deleteAttendanceLog(userID: number, timestamp: string) {
  const supabase = createClient()
  return supabase.from("attendancelogs").delete().eq("account_id_fk", userID).eq("timestamp", timestamp)
}

// EXCUSE REQUESTS
export async function getExcuseRequestsByUser(userID: number) {
  const supabase = createClient()
  return supabase.from("excuserequests").select("*").eq("account_id_fk", userID)
}
export async function createExcuseRequest(
  request: Database["public"]["Tables"]["excuserequests"]["Insert"],
) {
  const supabase = createClient()
  return supabase.from("excuserequests").insert([request])
}
export async function updateExcuseRequest(
  userID: number,
  date: string,
  type: string,
  updates: Partial<Database["public"]["Tables"]["excuserequests"]["Update"]>,
): Promise<any> {
  const supabase = createClient()
  return supabase.from("excuserequests").update(updates).eq("account_id_fk", userID).eq("date", date).eq("type", type)
}
export async function deleteExcuseRequest(userID: number, date: string, type: string) {
  const supabase = createClient()
  return supabase.from("excuserequests").delete().eq("account_id_fk", userID).eq("date", date).eq("type", type)
}

// DIRECTORY
export async function getDirectoryEntryByEmail(email: string) {
  const supabase = createClient()
  return supabase.from("directory").select("*").eq("email", email).single()
}
export async function createDirectoryEntry(entry: Database["public"]["Tables"]["directory"]["Insert"]) {
  const supabase = createClient()
  return supabase.from("directory").insert([entry])
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
