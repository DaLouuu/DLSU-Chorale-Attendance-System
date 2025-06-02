import type { Status } from "./database.types"

export interface ExcuseItem {
  id: number
  name: string
  voiceSection: string
  voiceNumber: number
  type: string
  date: string
  reason: string
  notes?: string
}

export interface HistoryItem {
  id: number
  name: string
  voiceSection: string
  voiceNumber: number
  type: string
  date: string
  status: Status
  declineReason?: string
}
