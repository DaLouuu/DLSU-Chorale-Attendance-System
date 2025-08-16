import { Database } from './database.types'

export type ExcuseRequest = Database['public']['Tables']['excuse_requests']['Row']
export type ExcuseRequestInsert = Database['public']['Tables']['excuse_requests']['Insert']
export type ExcuseRequestUpdate = Database['public']['Tables']['excuse_requests']['Update']

export type ExcuseStatus = Database['public']['Enums']['ExcuseStatus']
export type ExcuseType = Database['public']['Enums']['ExcuseType']

export interface ExcuseRequestWithProfile extends ExcuseRequest {
  profiles: {
    full_name: string | null
    email: string | null
    section: string | null
    committee: string | null
  }
}
