export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Users: {
        Row: {
          id: number
          name: string
          role: string
          committee: string | null
          verification: boolean
          section: string | null
          is_admin: boolean
        }
        Insert: {
          id?: number
          name: string
          role: string
          committee?: string | null
          verification?: boolean
          section?: string | null
          is_admin?: boolean
        }
        Update: {
          id?: number
          name?: string
          role?: string
          committee?: string | null
          verification?: boolean
          section?: string | null
          is_admin?: boolean
        }
      }
      AttendanceLogs: {
        Row: {
          userID: number
          timestamp: string
          attendance_log_meta: string | null
          synced: boolean
        }
        Insert: {
          userID: number
          timestamp: string
          attendance_log_meta?: string | null
          synced?: boolean
        }
        Update: {
          userID?: number
          timestamp?: string
          attendance_log_meta?: string | null
          synced?: boolean
        }
      }
      ExcuseRequests: {
        Row: {
          userID: number
          date: string
          reason: string
          status: string
          notes: string | null
          type: string | null
          eta: string | null
          etd: string | null
        }
        Insert: {
          userID: number
          date: string
          reason: string
          status: string
          notes?: string | null
          type?: string | null
          eta?: string | null
          etd?: string | null
        }
        Update: {
          userID?: number
          date?: string
          reason?: string
          status?: string
          notes?: string | null
          type?: string | null
          eta?: string | null
          etd?: string | null
        }
      }
      Directory: {
        Row: {
          id: number
          email: string
        }
        Insert: {
          id?: number
          email: string
        }
        Update: {
          id?: number
          email?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 