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
          account_id: string
          auth_user_id: string
          email: string
          name: string
          user_type: 'member' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          account_id?: string
          auth_user_id: string
          email: string
          name: string
          user_type: 'member' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          auth_user_id?: string
          email?: string
          name?: string
          user_type?: 'member' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_auth_user_id_fkey"
            columns: ["auth_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      attendancelogs: {
        Row: {
          account_id_fk: string
          attendance_log_method: Database["public"]["Enums"]["AttendanceLogMethod"]
          log_id: string
          synced: boolean | null
          timestamp: string
        }
        Insert: {
          account_id_fk: string
          attendance_log_method?: Database["public"]["Enums"]["AttendanceLogMethod"]
          log_id?: string
          synced?: boolean | null
          timestamp?: string
        }
        Update: {
          account_id_fk?: string
          attendance_log_method?: Database["public"]["Enums"]["AttendanceLogMethod"]
          log_id?: string
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
          }
        ]
      }
      excuses: {
        Row: {
          excuse_id: string
          account_id_fk: string
          event_id_fk: string
          reason: string
          status: Database["public"]["Enums"]["Status"]
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          decline_reason: string | null
        }
        Insert: {
          excuse_id?: string
          account_id_fk: string
          event_id_fk: string
          reason: string
          status?: Database["public"]["Enums"]["Status"]
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          decline_reason?: string | null
        }
        Update: {
          excuse_id?: string
          account_id_fk?: string
          event_id_fk?: string
          reason?: string
          status?: Database["public"]["Enums"]["Status"]
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          decline_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "excuses_account_id_fk_fkey"
            columns: ["account_id_fk"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          }
        ]
      }
      events: {
        Row: {
          event_id: string
          title: string
          description: string | null
          date: string
          start_time: string | null
          end_time: string | null
          location: string | null
          event_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          event_id?: string
          title: string
          description?: string | null
          date: string
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          event_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          event_id?: string
          title?: string
          description?: string | null
          date?: string
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          event_type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Status: "Pending" | "Approved" | "Rejected" | "Excused" | "Unexcused"
      AttendanceLogMethod: "RFID" | "Manual" | "WebApp"
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
