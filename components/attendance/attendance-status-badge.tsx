import type { AttendanceStatus } from "@/types/attendance"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle } from "lucide-react"

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus
}

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  switch (status) {
    case "present":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>Present</span>
        </Badge>
      )
    case "late":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Late</span>
        </Badge>
      )
    case "absent":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          <span>Absent</span>
        </Badge>
      )
    default:
      return null
  }
}
