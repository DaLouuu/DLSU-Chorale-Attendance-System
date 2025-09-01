export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ExcuseStatus = "Pending" | "Approved" | "Rejected"
export type LogMethod = "RFID" | "Manual"
export type LogStatus = "Late" | "On-time"
export type Role = "Not Applicable" | "Executive Board" | "Company Manager" | "Associate Company Manager" | "Conductor"
export type VoiceSection = "Soprano" | "Alto" | "Tenor" | "Bass"
export type Committee = "Production & Logistics" | "Finance" | "Documentations" | "Human Resources" | "Publicity & Marketing"
export type ExcuseType = "Absence" | "Late" | "Step Out" | "Leave Early"
export type MembershipStatus = "Trainee" | "Junior Member" | "Senior Member"
export type CurrentTermStat = "Inactive" | "Active (Performing)" | "Active (Non-performing)" | "Honorary (Graduating)" | "On Leave of Absence (LOA)" | "Resigned" | "Withdrawn Unofficially"
export type SecHeadType = "Not Applicable" | "Logistical" | "Musical"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          committee: Committee | null
          section: VoiceSection | null
          school_id: number | null
          degree_code: string | null
          college: string | null
          membership_status: MembershipStatus | null
          current_term_status: CurrentTermStat | null
          birthday: string | null
          last_name: string | null
          first_name: string | null
          middle_name: string | null
          nickname: string | null
          contact_number: number | null
          sechead_type: SecHeadType
          role: Role | null
        }
        Insert: {
          id?: string
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          committee?: Committee | null
          section?: VoiceSection | null
          school_id?: number | null
          degree_code?: string | null
          college?: string | null
          membership_status?: MembershipStatus | null
          current_term_status?: CurrentTermStat | null
          birthday?: string | null
          last_name?: string | null
          first_name?: string | null
          middle_name?: string | null
          nickname?: string | null
          contact_number?: number | null
          sechead_type?: SecHeadType
          role?: Role | null
        }
        Update: {
          id?: string
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          committee?: Committee | null
          section?: VoiceSection | null
          school_id?: number | null
          degree_code?: string | null
          college?: string | null
          membership_status?: MembershipStatus | null
          current_term_status?: CurrentTermStat | null
          birthday?: string | null
          last_name?: string | null
          first_name?: string | null
          middle_name?: string | null
          nickname?: string | null
          contact_number?: number | null
          sechead_type?: SecHeadType
          role?: Role | null
        }
        Relationships: []
      }
      attendance_logs: {
        Row: {
          log_id: number
          created_at: string
          profile_id_fk: string
          log_method: LogMethod
          log_status: LogStatus
          reh_id_fk: number | null
        }
        Insert: {
          log_id?: number
          created_at?: string
          profile_id_fk: string
          log_method: LogMethod
          log_status: LogStatus
          reh_id_fk?: number | null
        }
        Update: {
          log_id?: number
          created_at?: string
          profile_id_fk?: string
          log_method?: LogMethod
          log_status?: LogStatus
          reh_id_fk?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_profile_id_fk_fkey"
            columns: ["profile_id_fk"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_reh_id_fk_fkey"
            columns: ["reh_id_fk"]
            referencedRelation: "rehearsals"
            referencedColumns: ["reh_id"]
          }
        ]
      }
      excuse_requests: {
        Row: {
          request_id: number
          created_at: string
          profile_id_fk: string
          excuse_type: ExcuseType
          excuse_reason: string | null
          request_date: string
          request_time: string | null
          status: ExcuseStatus
          admin_notes: string | null
          admin_id_fk: string | null
        }
        Insert: {
          request_id?: number
          created_at?: string
          profile_id_fk: string
          excuse_type: ExcuseType
          excuse_reason?: string | null
          request_date: string
          request_time?: string | null
          status?: ExcuseStatus
          admin_notes?: string | null
          admin_id_fk?: string | null
        }
        Update: {
          request_id?: number
          created_at?: string
          profile_id_fk?: string
          excuse_type?: ExcuseType
          excuse_reason?: string | null
          request_date?: string
          request_time?: string | null
          status?: ExcuseStatus
          admin_notes?: string | null
          admin_id_fk?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "excuse_requests_admin_id_fk_fkey"
            columns: ["admin_id_fk"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excuse_requests_profile_id_fk_fkey"
            columns: ["profile_id_fk"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      rehearsals: {
        Row: {
          rehearsal_date: string
          start_time: string
          end_time: string
          notes: string | null
        }
        Insert: {
          rehearsal_date: string
          start_time: string
          end_time: string
          notes?: string | null
        }
        Update: {
          rehearsal_date?: string
          start_time?: string
          end_time?: string
          notes?: string | null
        }
        Relationships: []
      }
      directory: {
        Row: {
          id: number
          created_at: string
          school_id: number
          email: string
          full_name: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          school_id: number
          email: string
          full_name?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          school_id?: number
          email?: string
          full_name?: string | null
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
      ExcuseStatus: "Pending" | "Approved" | "Rejected"
      LogMethod: "RFID" | "Manual"
      LogStatus: "Late" | "On-time"
      Role: "Not Applicable" | "Executive Board" | "Company Manager" | "Associate Company Manager" | "Conductor"
      VoiceSection: "Soprano" | "Alto" | "Tenor" | "Bass"
      Committee: "Production & Logistics" | "Finance" | "Documentations" | "Human Resources" | "Publicity & Marketing"
      ExcuseType: "Absence" | "Late" | "Step Out" | "Leave Early"
      MembershipStatus: "Trainee" | "Junior Member" | "Senior Member"
      CurrentTermStat: "Inactive" | "Active (Performing)" | "Active (Non-performing)" | "Honorary (Graduating)" | "On Leave of Absence (LOA)" | "Resigned" | "Withdrawn Unofficially"
      SecHeadType: "Not Applicable" | "Logistical" | "Musical"
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
  ? keyof (
    Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"]
  )
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (
    Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"]
  )[TableName] extends {
    Row: infer R
  }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (
    Database["public"]["Tables"] &
    Database["public"]["Views"]
  )
  ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
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
  ? Database["public"]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
