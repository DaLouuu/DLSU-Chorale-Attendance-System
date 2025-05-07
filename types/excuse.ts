export interface ExcuseItem {
    id: string
    name: string
    voiceSection: "soprano" | "alto" | "tenor" | "bass"
    voiceNumber: number
    type: "ABSENT" | "LATE"
    date: string
    reason: string
    notes?: string
    profileImage?: string
  }
  
  export interface HistoryItem {
    id: string
    name: string
    voiceSection: "soprano" | "alto" | "tenor" | "bass"
    voiceNumber: number
    type: "ABSENT" | "LATE"
    date: string
    status: "APPROVED" | "DECLINED"
    declineReason?: string
    profileImage?: string
  }
  