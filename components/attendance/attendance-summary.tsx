import type { AttendanceRecord } from "@/types/attendance"

interface AttendanceSummaryProps {
  attendanceData: AttendanceRecord[]
}

export function AttendanceSummary({ attendanceData }: AttendanceSummaryProps) {
  // Calculate attendance statistics
  const totalEvents = attendanceData.length
  const presentCount = attendanceData.filter((record) => record.status === "present").length
  const lateCount = attendanceData.filter((record) => record.status === "late").length
  const absentCount = attendanceData.filter((record) => record.status === "absent").length

  // Calculate attendance rate
  const attendanceRate = totalEvents > 0 ? Math.round((presentCount / totalEvents) * 100) : 0

  // Calculate total fees
  const lateFees = lateCount * 50 // ₱50 per late
  const absentFees = absentCount * 100 // ₱100 per absence
  const totalFees = lateFees + absentFees

  return (
    <div className="border-t border-gray-200 pt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendance Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Attendance Rate</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{attendanceRate}%</span>
              <span className="text-sm text-gray-500 mb-1">of events attended</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-700">{presentCount}</div>
              <div className="text-xs text-green-600">Present</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-700">{lateCount}</div>
              <div className="text-xs text-yellow-600">Late</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-700">{absentCount}</div>
              <div className="text-xs text-red-600">Absent</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Fee Summary</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Late Fees ({lateCount} × ₱50)</span>
              <span className="text-sm font-medium">₱{lateFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Absence Fees ({absentCount} × ₱100)</span>
              <span className="text-sm font-medium">₱{absentFees.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-medium">Total Fees</span>
                <span className="font-bold text-red-600">₱{totalFees.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {totalFees > 0 && (
            <div className="mt-4 text-xs text-gray-500">
              Please settle your fees with the treasurer before the end of the month.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
