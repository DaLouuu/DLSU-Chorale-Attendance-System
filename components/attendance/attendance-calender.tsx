"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance"
import { AttendanceStatusBadge } from "@/components/attendance/attendance-status-badge"

interface AttendanceCalendarProps {
  attendanceData: AttendanceRecord[]
}

export function AttendanceCalendar({ attendanceData }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Generate days for the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Navigate to previous/next month
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Find attendance record for a specific date
  const getAttendanceForDate = (date: Date) => {
    return attendanceData.find((record) => isSameDay(new Date(record.date), date))
  }

  // Calculate fee for a specific attendance record
  const calculateFee = (status: AttendanceStatus): number => {
    switch (status) {
      case "absent":
        return 100 // ₱100 for absence
      case "late":
        return 50 // ₱50 for late
      default:
        return 0
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Attendance Calendar</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</span>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[768px]">
          {/* Calendar header - days of week */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const attendance = getAttendanceForDate(day)
              const hasAttendance = !!attendance

              return (
                <div
                  key={day.toString()}
                  className={`
                    min-h-[80px] p-2 border rounded-md relative
                    ${hasAttendance ? "border-gray-300" : "border-gray-200 bg-gray-50"}
                    ${isSameDay(day, selectedDate || new Date()) ? "ring-2 ring-primary ring-offset-1" : ""}
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-sm font-medium">{format(day, "d")}</div>

                  {attendance && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="mt-2 flex flex-col gap-1">
                            <div className="text-xs font-medium">
                              {attendance.type === "rehearsal" ? "Rehearsal" : "Performance"}
                            </div>
                            <AttendanceStatusBadge status={attendance.status} />
                            {(attendance.status === "late" || attendance.status === "absent") && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                <Info className="h-3 w-3" />
                                <span>Fee: ₱{calculateFee(attendance.status)}</span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1 p-1">
                            <p className="font-medium">{format(day, "MMMM d, yyyy")}</p>
                            <p>{attendance.type === "rehearsal" ? "Rehearsal" : "Performance"}</p>
                            <p>Status: {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}</p>
                            {attendance.notes && <p>Notes: {attendance.notes}</p>}
                            {(attendance.status === "late" || attendance.status === "absent") && (
                              <p className="font-medium">Fee: ₱{calculateFee(attendance.status)}</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-sm">Late (₱50 fee)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm">Absent (₱100 fee)</span>
        </div>
      </div>
    </div>
  )
}
