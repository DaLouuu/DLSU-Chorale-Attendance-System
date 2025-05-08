import { supabase } from './supabase'
import type { Database } from '@/types/database.types'

// USERS
export async function getUserById(id: number) {
  return supabase.from('Users').select('*').eq('id', id).single()
}
export async function createUser(user: Omit<Database['public']['Tables']['Users']['Insert'], 'id'>) {
  return supabase.from('Users').insert([user])
}
export async function updateUser(id: number, updates: Partial<Database['public']['Tables']['Users']['Update']>) {
  return supabase.from('Users').update(updates).eq('id', id)
}
export async function deleteUser(id: number) {
  return supabase.from('Users').delete().eq('id', id)
}

// ATTENDANCE LOGS
export async function getAttendanceLogsByUser(userID: number) {
  return supabase.from('AttendanceLogs').select('*').eq('userID', userID)
}
export async function createAttendanceLog(log: Database['public']['Tables']['AttendanceLogs']['Insert']) {
  return supabase.from('AttendanceLogs').insert([log])
}
export async function updateAttendanceLog(userID: number, timestamp: string, updates: Partial<Database['public']['Tables']['AttendanceLogs']['Update']>) {
  return supabase.from('AttendanceLogs').update(updates).eq('userID', userID).eq('timestamp', timestamp)
}
export async function deleteAttendanceLog(userID: number, timestamp: string) {
  return supabase.from('AttendanceLogs').delete().eq('userID', userID).eq('timestamp', timestamp)
}

// EXCUSE REQUESTS
export async function getExcuseRequestsByUser(userID: number) {
  return supabase.from('ExcuseRequests').select('*').eq('userID', userID)
}
export async function createExcuseRequest(request: Database['public']['Tables']['ExcuseRequests']['Insert']) {
  return supabase.from('ExcuseRequests').insert([request])
}
export async function updateExcuseRequest(userID: number, date: string, updates: Partial<Database['public']['Tables']['ExcuseRequests']['Update']>) {
  return supabase.from('ExcuseRequests').update(updates).eq('userID', userID).eq('date', date)
}
export async function deleteExcuseRequest(userID: number, date: string) {
  return supabase.from('ExcuseRequests').delete().eq('userID', userID).eq('date', date)
}

// DIRECTORY
export async function getDirectoryEntryById(id: number) {
  return supabase.from('Directory').select('*').eq('id', id).single()
}
export async function createDirectoryEntry(entry: Omit<Database['public']['Tables']['Directory']['Insert'], 'id'>) {
  return supabase.from('Directory').insert([entry])
}
export async function updateDirectoryEntry(id: number, updates: Partial<Database['public']['Tables']['Directory']['Update']>) {
  return supabase.from('Directory').update(updates).eq('id', id)
}
export async function deleteDirectoryEntry(id: number) {
  return supabase.from('Directory').delete().eq('id', id)
} 