export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Status = "Pending" | "Approved" | "Rejected" | "Excused" | "Unexcused"
export type AttendanceLogMethod = "RFID" | "Manual" | "WebApp"

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          account_id: number
          auth_user_id: string | null
          committee: string | null
          directory_id: number | null
          is_execboard: boolean
          is_sechead: boolean
          name: string | null
          role: string | null
          section: string | null
          user_type: string | null
        }
        Insert: {
          account_id?: number // Generated, so optional
          auth_user_id?: string | null
          committee?: string | null
          directory_id?: number | null
          is_execboard?: boolean // DEFAULT false in DB
          is_sechead?: boolean // DEFAULT false in DB
          name?: string | null
          role?: string | null
          section?: string | null
          user_type?: string | null
        }
        Update: {
          account_id?: number
          auth_user_id?: string | null
          committee?: string | null
          directory_id?: number | null
          is_execboard?: boolean
          is_sechead?: boolean
          name?: string | null
          role?: string | null
          section?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_auth_user_id_fkey"
            columns: ["auth_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_directory_id_fkey"
            columns: ["directory_id"]
            isOneToOne: true
            referencedRelation: "directory"
            referencedColumns: ["id"]
          },
        ]
      }
      attendancelogs: {
        Row: {
          account_id_fk: number
          attendance_log_method: Database["public"]["Enums"]["AttendanceLogMethod"]
          log_id: number
          synced: boolean | null
          timestamp: string
        }
        Insert: {
          account_id_fk: number
          attendance_log_method?: Database["public"]["Enums"]["AttendanceLogMethod"] // DEFAULT 'RFID'
          log_id?: number // Generated, so optional
          synced?: boolean | null // DEFAULT true
          timestamp?: string // DEFAULT now()
        }
        Update: {
          account_id_fk?: number
          attendance_log_method?: Database["public"]["Enums"]["AttendanceLogMethod"]
          log_id?: number
          synced?: boolean | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendancelogs_account_id_fkey"
            columns: ["account_id_fk"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          },
        ]
      }
      directory: {
        Row: {
          email: string
          id: number // This is the student ID
        }
        Insert: {
          email: string
          id: number // This is the student ID, not generated
        }
        Update: {
          email?: string
          id?: number
        }
        Relationships: []
      }
      excuserequests: {
        Row: {
          account_id_fk: number
          date: string | null
          eta: string | null // time with time zone
          etd: string | null // time with time zone
          notes: string | null
          reason: string
          request_id: number
          status: Database["public"]["Enums"]["Status"]
          type: string
        }
        Insert: {
          account_id_fk: number
          date?: string | null
          eta?: string | null
          etd?: string | null
          notes?: string | null // DEFAULT 'null'::text
          reason?: string // DEFAULT 'null'::text
          request_id?: number // Generated, so optional
          status?: Database["public"]["Enums"]["Status"] // DEFAULT 'Pending'
          type: string
        }
        Update: {
          account_id_fk?: number
          date?: string | null
          eta?: string | null
          etd?: string | null
          notes?: string | null
          reason?: string
          request_id?: number
          status?: Database["public"]["Enums"]["Status"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "excuserequests_account_id_fkey"
            columns: ["account_id_fk"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AttendanceLogMethod: "RFID" | "Manual" // Assuming 'Manual' as another option. Please verify.
      Status: "Pending" | "Approved" | "Rejected" // Assuming these are the states. Please verify.
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types, typically provided by supabase-js
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
/*
Note on Enums:
- AttendanceLogMethod: Your schema specified a DEFAULT 'RFID'. I've added "Manual" as a common alternative.
- Status: Your schema specified a DEFAULT 'Pending'. I've added "Approved" and "Rejected" as common alternatives.
Please review and adjust these Enum values if they don't match your application's requirements.
*/
