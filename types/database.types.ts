export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Status = "Pending" | "Approved" | "Rejected" | "Excused" | "Unexcused"
export type AttendanceLogMethod = "RFID" | "Manual" | "WebApp"

export interface Database {
  public: {
    Tables: {
      Accounts: {
        Row: {
          id: number
          name: string
          role: string | null
          committee: string
          section: string | null
          user_type: string
          is_sechead: boolean
          is_execboard: boolean
          auth_user_id: string | null
        }
        Insert: {
          id: number
          name: string
          role?: string | null
          committee: string
          section?: string | null
          user_type: string
          is_sechead?: boolean
          is_execboard: boolean
          auth_user_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          role?: string | null
          committee?: string
          section?: string | null
          user_type?: string
          is_sechead?: boolean
          is_execboard?: boolean
          auth_user_id?: string | null
        }
      }
      AttendanceLogs: {
        Row: {
          userID: number
          timestamp: string
          attendance_log_method: AttendanceLogMethod
          synced: boolean
        }
        Insert: {
          userID: number
          timestamp: string
          attendance_log_method?: AttendanceLogMethod
          synced?: boolean
        }
        Update: {
          userID?: number
          timestamp?: string
          attendance_log_method?: AttendanceLogMethod
          synced?: boolean
        }
      }
      ExcuseRequests: {
        Row: {
          userID: number
          date: string
          reason: string
          status: Status
          notes: string | null
          type: string
          eta: string | null
          etd: string | null
        }
        Insert: {
          userID: number
          date: string
          reason: string
          status: Status
          notes?: string | null
          type: string
          eta?: string | null
          etd?: string | null
        }
        Update: {
          userID?: number
          date?: string
          reason?: string
          status?: Status
          notes?: string | null
          type?: string
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
      Status: Status
      AttendanceLogMethod: AttendanceLogMethod
    }
  }
}
