export type AttendanceStatus = "present" | "late" | "absent"
export type AttendanceType = "rehearsal" | "performance"

export interface AttendanceRecord {
  id: string
  date: Date
  type: AttendanceType
  status: AttendanceStatus
  notes?: string
}
